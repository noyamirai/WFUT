# :notebook_with_decorative_cover: WSLH - Product documentation

For the course "Progressive Web Apps" everyone was tasked to convert their Single Page web App (SPA) from " "Web App From Scratch" into a progressive web application (PWA). The teachers gave us about three weeks for this assignment. Instead of rendering everything through client-side, we now had to render everything from server-side and then add enhancement through client-side later. Another important aspect is that we primarily focus on making sure we deliver the best and most optimal performance for users from all over the web.

You can read the previous product documentation, containing a briefing, my user story decision, initial design choices and other technical implementations [here](./prev_productdoc.md).

## :art: Slight design revamp

As you might already be aware, I developed a football application to keep you up-to-date with your favorite teams in the FA Women's Super League by using the following user story:

> "As a Women's Super League enjoyer, I want to be able to quickly view the latest standings of the league, get to know all the teams and see when their next games will be played, so that I can stay up-to-date on the league and the teams"

Since I wasn't really happy with my initial design, I decided to redesign my app (only a little). The initial design and its colors were made with the idea for it to be similar to the FA Women Super League. My ambition is for this app to be its own standalone app, so I figured I should create a 'new' branding that wasn't heavily inspired or reliant on the WSL. Due to lack of time I only spent time designing a new general 'look & feel'.

![Design revamp](./assets/WFUT-design_revamp.png)

I'm still not 100% happy with it, but this is not a design related course, so I accepted it and moved on :stuck_out_tongue:

<!-- Included are an explanation of client- server rendering, an activity diagram including the Service Worker and a list of enhancements to optimize the critical render path implemented your app. -->

## CSR vs SSR

text


## Performance optimization

text here


```js

const setTeamData = async (dataArray, onlyTeamData = false) => {
    ...
    this.getTeamDetails(id);
}

const getTeamDetails = async (idTeam) => {
    ...
}

// original function (looping, waiting for all promises, foreach to check in session or if all false) -> 6s
// without session usage -> 3s
// with session usage -> 300ms
// with service worker -> 3ms
```

text

```js
// waiting for server response time
// api itself and when nothing implemented -> 200ms
// with req.session -> 30ms
// without service worker or with service worker on intial load -> 70-200ms
// with service worker after initial load -> 2ms 

// req.session usage bc i dont want to perform multiple calls 
```

### Service worker
diagram including service worker

explain cache strategy -> stale while revalidate (cache control middleware)

show service worker impl.

<!-- TOOD: page transition API -->