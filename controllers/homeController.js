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
        let upcomingGames = await this.teamController.setUpcomingEvents(fetchData[1]);

        return { 'teams': teams, 'upcomingGames': upcomingGames };
    }

}

export default HomeController;