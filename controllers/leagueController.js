import fs from 'fs';
import apiClass from '../helpers/api.js';

class LeagueController {

    constructor(api_key) {
        this.apiKey = api_key;
        this.API = new apiClass(this.apiKey);
    }

    listLeagueTeamsFromFile = () => {
        let leagueTeamsFile = fs.readFileSync('./src/league_teams.json', 'utf8');
        const jsonData = JSON.parse(leagueTeamsFile);

        return jsonData;
    }

    listLeagueTeamsFromApi = async () => {
        const jsonData = await this.API.getJsonData(`search_all_teams.php?l=English_Womens_Super_League`);
        return jsonData;
    }

    getLeagueTeamFromFile = (idTeam) => {

        if (!idTeam) {
            return [];
        }

        let leagueTeamsFile = fs.readFileSync('./src/league_teams.json', 'utf8');
        const jsonData = JSON.parse(leagueTeamsFile);

        let foundObject = jsonData.find(obj => obj.idTeam == idTeam);
        
        if (!foundObject) {
            return [];
        }

        return foundObject;

    }
}

export default LeagueController;