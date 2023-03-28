import apiClass from '../helpers/api.js';
import TeamController from './teamController.js';
import { sortByTime, sortByDate } from '../helpers/utils.js';

class HomeController {

    constructor(api_key, sessionLeagues) {
        this.apiKey = api_key;
        this.leagueId = 4849;
        this.sessionLeagues = sessionLeagues
        this.API = new apiClass(this.apiKey);
        this.teamController = new TeamController(this.apiKey, this.sessionLeagues);
    }

    getHomeData = async () => {

        const fetches = [
            `search_all_teams.php?l=English_Womens_Super_League`,
            `eventsnextleague.php?id=${this.leagueId}`
        ];

        const fetchData = await this.API.getMultipleJsonDatas(fetches);
        let teams = fetchData[0];
        let upcomingGames = await this.setUpcomingEvents(fetchData[1]);

        return { 'teams': teams, 'upcomingGames': upcomingGames };
    }

    setUpcomingEvents = async (eventJsonData = false) => {

        if (!eventJsonData)
            eventJsonData = await this.API.getJsonData(`eventsnextleague.php?id=${this.leagueId}`);

        if (eventJsonData.failed)
            return [];
        
        let gamesByDate = {};
        const result = eventJsonData.sort(sortByDate);
        const populatedTeams = await this.teamController.setTeamData(result);
        
        for (const event of populatedTeams) {

            if (Object.keys(gamesByDate).length == 3 && !Object.keys(gamesByDate).includes(event.dateEvent)) {
                continue;
            }

            if (Object.keys(gamesByDate).includes(event.dateString)) {
                gamesByDate[event.dateString].push(event);    
            } else {
                gamesByDate[event.dateString] = [];
                gamesByDate[event.dateString].push(event);
            }

        };

        for (const key in gamesByDate) {
            const event = gamesByDate[key];
            gamesByDate[key] = sortByTime(event);
        }
                
        return gamesByDate;
    }

}

export default HomeController;