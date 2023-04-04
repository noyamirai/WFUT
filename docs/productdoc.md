# :notebook_with_decorative_cover: WSLH - Product documentation

For the course "Progressive Web Apps" everyone was tasked to convert their Single Page web App (SPA) from "Web App From Scratch" into a progressive web application (PWA). The teachers gave us about three weeks for this assignment. Instead of rendering everything through client-side, we now had to render everything from server-side and then add enhancement through client-side later. Another important aspect is that we primarily focus on making sure we deliver the best and most optimal performance for users from all over the web.

You can read the previous product documentation, containing a briefing, my user story decision, initial design choices and other technical implementations [here](./prev_productdoc.md).

## :art: Slight design revamp

As you might already be aware, I developed a football application to keep you up-to-date with teams from the FA Women's Super League by using the following user story:

> "As a Women's Super League enjoyer, I want to be able to quickly view the latest standings of the league, get to know all the teams and see when their next games will be played, so that I can stay up-to-date on the league and the teams"

Since I wasn't really happy with my initial design, I decided to redesign my app (only a little). The initial design and its colors were made with the idea for it to be similar to the FA Women Super League. My ambition is for this app to be its own standalone app, so I figured I should create a 'new' branding that wasn't heavily inspired or reliant on the WSL. Due to lack of time I only spent time designing a new general 'look & feel'.

![Design revamp](./assets/WFUT-design_revamp.png)

I'm still not 100% happy with it, but this is not a design related course, so I accepted it and moved on :stuck_out_tongue:

<!-- Included are an explanation of client- server rendering, an activity diagram including the Service Worker and a list of enhancements to optimize the critical render path implemented your app. -->

## CSR vs SSR
Our single-page web app from "Web App from Scratch" was a client-side rendered app, also known as CSR. CSR is a technique used in web development where the browser is responsible for rendering all the HTML, CSS and Javascript. With server-side rendering (SSR) the server is responsible for rendering everything. The server generates the HTML code and then sends it to the client, which then displays the content to the user.

As you can imagine, using SSR is typically faster. It sends the entire HTML document straight to the client without needing to download and execute JS, whereas with CSR the client needs to render everything by itself. However, there's no clear winner as to which is the best technique. Both have their advantages and disadvantages. It all depends on the use case and what would be best for the application's needs.

Some apps use both techniques. This is also known as "isomorphic rendering". Using both SSR and CSR allows you to use SSR for the initial page load and CSR to update content dynamically. Isomorphic rendering therefore provides better performance and quicker content updates.

## Performance optimization

To provide users the best user experience and app performance I needed to improve the initial load of the app, and throughout the app itself. In my CSR SPA I mainly used localstorage to gain access to data, since I felt it was unneccessary to perform calls every X time. With a SSR PWA I am now able to implement sessions within the server. If the user's JS fails to work or load for whatever reason, their session will remain, whereas with my CSR app it would most likely break.

Throughout the development process I stumbled upon several 'performance issues'. The first one occured during implementation of the very first api calls I had to make to populate the home page. The server response time of the API itself was about 200ms. As I did not want to perform countless API calls on each request (reloading pages etc), I implemented Express session to store the league teams. These teams, including their logos and ids, will rarely change, so it would not be necessary to fetch these details on every request. So, storing them in the server's session meant one request less! 

```js
if (req.session.home_data) {
    console.log('data exists');
    homeData = req.session.home_data;

} else {
    console.log('No home data in session yet! Fetch and save');

    const leagueController = new LeagueController(process.env.API_KEY);
    const leagueTeams = await leagueController.getLeagueTeamsFromApi();
    req.session.league_teams = leagueTeams;

    const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    const upcomingGames = await teamController.setUpcomingEvents();

    homeData.push({
        partial: 'teamlist',
        className: 'teamlist',
        data: leagueTeams
    });

    homeData.push({
        partial: 'gamelist',
        className: 'game',
        data: upcomingGames
    });

    req.session.home_data = homeData;
}
```

After using Express session the response time decreased from 200ms to 30ms! This improvement is great, however it still means the initial load server response time is still 70-200ms, so it is only relevant for repeat visits. The next step was using a service worker, which I will discuss in the next chapter, but using a service worker improved the performance on repeat visits significantly! It went from 70-200ms to 2ms. COOL!

The second one occured when navigating to a team details page. Due to the fact that I need to perform at least 3 calls and manipulate all data on initial load, you can imagine it was a shit show. It was unmanagable, chaotic, too many lines and most importantly, it was super slow... The server response time of fetching team details took 6 seconds! So, first thing I did was refactor the code into something more compact. The refactoration caused the server response time to decrease from 6 seconds to 3 seconds! A clear improvement, but still too slow.

After I felt like this was the best I could do considering the amount of data I had to manipulate before serving to the client, I made use of Express session. I had already made use of the session by storing all league teams, but I forgot to implement it in the code! Once you've visited the home page you should have league teams in your session, meaning fetching team data (name and logo) would not be necessary anymore.

```js
getTeamDataFromSession = (sessionDataArray, idTeam) => {

    if (!sessionDataArray) { return false; }

    const idExists = sessionDataArray.find(item => item.idTeam === idTeam);

    if (!idExists) { return { failed: true, idTeam: idTeam}; }

    return idExists;
}

populateTeams = async (dataArray, onlyTeamData = false) => {
    ...

    console.log('checking home and away teams from session');

    const homeTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, dataArray.idHomeTeam);
    const awayTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, dataArray.idAwayTeam);
    const eventTeams = [homeTeamDataFromSession, awayTeamDataFromSession];
    const allUnknown = eventTeams.every(value => value === false);

    if (allUnknown) {
        console.log('both still unknown');
        const fetchData = await this.getHomeAndAwayTeamData(dataArray.idHomeTeam, dataArray.idAwayTeam);
        newTeams[0] = fetchData.homeTeam;
        newTeams[1] = fetchData.awayTeam;

    } else {

        console.log('one team may be unknown');

        for(let teamData of eventTeams) {
            
            if (teamData.failed) {
                console.log('fetch extra team data');
                const newTeamData = await this.getTeamData(teamData.idTeam);
                teamData = newTeamData
            }

            newTeams.push(teamData);
        };

    }

    ...
}
```

After implementing the session usage the server response time went down from 3 seconds to 300 miliseconds! In the next chapter I will talk about service workers and my implementation of it, but using service workers also improved the server response time of team details even more! It went from 300ms to 3ms!

![Performance comparison](./assets/WFUT-performance_comparison.png)

A few other things I did to improve the performance was create my own json file including all league teams and paths to their respective logos (png and webp). Instead of reading the logos from the api, I now get them from the server and create more control (provide webp option). I also compress and minfiy my css and js using `gulp` in my build scripts.

```json
"scripts": {
    "prestart": "npm run build",
    "prestart:dev": "npm run build",
    "start": "node server.js",
    "start:dev": "nodemon --inspect server.js & npm run watch",
    "prebuild": "rimraf ./static",
    "build": "npm-run-all build:*",
    "build:css": "node scripts/build-css.js",
    "build:assets": "node scripts/build-static-assets.js",
    "build:js": "node scripts/build-js.js",
    "watch": "run-p watch:*",
    "watch:css": "chokidar 'src/styles/*.css' --command 'npm run build:css'",
    "watch:assets": "chokidar 'src/images/*.*' --command 'npm run build:assets'",
    "watch:js": "chokidar 'src/js/*.*' --command 'npm run build:js'"
  }
```

After implementing all these things to improve performance, I went on to check the performance score on LightHouse. And to my surprise, these were the results!

![Lighthouse Score](./assets/WFUT-performance_score.png)

### Service worker

A service worker runs in the background of a website or web app, separate from the main thread. It intercepts network requests and can modify or cache the responses. Using a service worker not only allows you to create an offline web app, but it also improves the overall performance by caching resources. This helps reducing the need for the browser to make network requests to the server.

There are a few caching strategies, but for WFUT I used the "stale-while-revalidate" strategy. This strategy allows the web app to serve stale content while also fetching updated content from the server in the background. Using this strategy means you are basically always one update behind, but it improves the perceived performance and reduces the amount of time that the user has to wait for content to load. In the activity diagram below you can see how it works:

![WFUT Activity diagram](./assets/WFUT-activity_diagram.jpg)

In WFUT I'm using the page transition api, this api intercepts internal requests and updates the current body by fetching content from the server. This allows the api to add smooth transitions giving it a "real" app feel. I slightly adjusted the onLinkNavigate function to check if the requested path response is available in the cache. If not, a loader will be shown on screen before transitioning to said page. Regardless of it existing in cache, I make a request to fetch the content, which gets intercepted by the service worker, ensuring the cached content always stays up-to-date. In the code snippet below you can see the actual implementation:

```js
onLinkNavigate(async ({ toPath, fromPath }) => {
  let content;
  let loaderShown = false;

  const cache = await caches.open('other-cache');
  const cachedResponse = await cache.match(toPath);
  let loaderType = 'main';

  if (!cachedResponse) {

    if (toPath.includes('team-details') && fromPath.includes('team-details')) {
      loaderType = 'widget';
    }

    loaderShown = true;
    showLoader(loaderType);
  }

  console.log('initiating fetch');
  content = await getPageContent(toPath);

  console.log('cached content: ', cachedResponse);

  if (loaderShown) {
    ...
  }

  startViewTransition(async () => {

    document.body.innerHTML = content; 

    if (loaderShown) {
      hideLoader(loaderType);
    }

    lazyLoadHandler(cachedResponse);

  });
});
```

As you can see in the snippet above, I also implemented (with help of chatGPT) a check to see when player images are fully loaded, since I added the `loading="true"` attribute to the images. Before they are loaded in, in CSS I create a skeleton animation effect to let the user know the images are on their way! This ensures that the images of players are fully loaded when navigating to the squad page. This improved the overal performance and user experience a lot. See video comparison below.

<div style="position:relative;width:fit-content;height:fit-content;">
    <iframe allow="autoplay;" allowfullscreen style="border:none" src="https://clipchamp.com/watch/jroS8LJr2Ol/embed" width="640" height="360"></iframe>
</div>