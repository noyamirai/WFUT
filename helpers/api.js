import fetch from 'node-fetch';

class ApiClass {

    constructor(api_key) {
        this.apiKey = api_key;
        this.leagueId = 4849;
    }

    getResultKey = (data) => {
        let objectKey;

        for (const key in data) {
            objectKey = Object.keys(data)[0];
        }

        return objectKey;
    }

    sortByDate = (a, b) => {
        return new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime();
    } 


    getLeagueTeams = async () => {
        const jsonData = await this.getJsonData(`search_all_teams.php?l=English_Womens_Super_League`);
        return jsonData;
    }

    getTeamData = async (idTeam) => {
        const jsonTeamData = await this.getJsonData(`lookupteam.php?id=${idTeam}`);

        return jsonTeamData[0];
    }

    getTeamDetails = async (idTeam) => {

        const jsonTeamData = await this.getJsonData(`lookupteam.php?id=${idTeam}`);

        const jsonPrevGamesData = await this.getJsonData(`eventslast.php?id=${idTeam}`);
        const jsonNextGamesData = await this.getJsonData(`eventsnext.php?id${idTeam}`);
        const jsonSquadData = await this.getJsonData(`lookup_all_players.php?id=${idTeam}`);

        let squadArray = {};

        console.log(jsonSquadData);
        
        // Transform the squad array into an object with keys based on player positions
        jsonSquadData.forEach((player, key) => {

            // create position in array
            if (!squadArray[player.strPosition]) {
                squadArray[player.strPosition] = [];
            }

            squadArray[player.strPosition].push(player);
        });

         const result = {
            'team_data': jsonTeamData,
            'previous_games': jsonPrevGamesData,
            'next_games': jsonNextGamesData,
            'squad': squadArray
        }

        return result;
    }

    getUpcomingEvents = async () => {

        const eventJsonData = await this.getJsonData(`eventsnextleague.php?id=${this.leagueId}`);

        if (eventJsonData.failed) {
            return [];
        }
        
        let result = eventJsonData.sort(this.sortByDate);
        let gamesByDate = {};
        
        for (const event of result) {
        // result.forEach(async (event) => {

            if (Object.keys(gamesByDate).length == 3 && !Object.keys(gamesByDate).includes(event.dateEvent)) {
                continue;
            }

            const homeTeamData = await this.getTeamData(event.idHomeTeam);
            const awayTeamData = await this.getTeamData(event.idAwayTeam);
            event.homeTeamData = homeTeamData;
            event.awayTeamData = awayTeamData;

            if (Object.keys(gamesByDate).includes(event.dateEvent)) {
                gamesByDate[event.dateEvent].push(event);    
            } else {
                gamesByDate[event.dateEvent] = [];
                gamesByDate[event.dateEvent].push(event);
            }

        // });
        };

        for (const key in gamesByDate) {
            const event = gamesByDate[key];
            gamesByDate[key] = this.sortByTime(event);
        }
                
        return gamesByDate;
    }

    sortByTime = (array) => {
        const result = array.sort((a, b) => {
            if (a['strTimeLocal'] < b['strTimeLocal']) return -1;
            if (a['strTimeLocal'] > b['strTimeLocal']) return 1;
            return 0
        });

        return result;
    }

    getJsonData = async (params) => {

        const jsonData = await this.apiCall(params);


        // todo: error handling
        if (jsonData.failed) {
            return jsonData;
        }

        const resultKey = this.getResultKey(jsonData);
                console.log(resultKey);

        return jsonData[resultKey];
    }

    apiCall = async (uri) => {

        try {

            const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${this.apiKey}/${uri}`);

            if (response.ok) {
                const data = await response.json();
                return data;
            }

            return { failed: true, error:`HTTP error! Status: ${response.status}`, data: []};
            
        } catch (error) {
            return { failed: true, error:`${error}`, data: []};
        }
    }

}

export default ApiClass;