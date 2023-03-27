import fetch from 'node-fetch';
import { getFormattedDate, getLocalTime } from './utils.js';

class ApiClass {

    constructor(api_key, sessionLeagues) {
        this.apiKey = api_key;
        this.leagueId = 4849;
        this.sessionLeagues = sessionLeagues
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

    setTeamData = async (dataArray, onlyTeamData = false) => {
        

        if (Array.isArray(dataArray)) {

            console.log('MULTIPLE TEAM DETAILS');

            let result = [];
        
            for (const event of dataArray) {

                console.log('checking home and away teams from session');

                const homeTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, event.idHomeTeam);
                const awayTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, event.idAwayTeam);
                const eventTeams = [homeTeamDataFromSession, awayTeamDataFromSession];
                const allUnknown = eventTeams.every(value => value === false);

                let newTeams = [];

                if (allUnknown) {

                    console.log('none are known!');
                    
                    const fetches = [
                        `lookupteam.php?id=${event.idHomeTeam}`,
                        `lookupteam.php?id=${event.idAwayTeam}`
                    ];

                    const fetchData = await this.getMultipleJsonDatas(fetches);
                    newTeams[0] = fetchData[0][0];
                    newTeams[1] = fetchData[1][0];


                } else {

                    for(let teamData of eventTeams) {
                        
                        if (teamData.failed) {
                            console.log('fetch extra team data');
                            const newTeamData = await this.getTeamData(teamData.idTeam);
                            teamData = newTeamData
                        }

                        newTeams.push(teamData);
                    };

                }

                const homeTeamData = newTeams[0];
                const awayTeamData = newTeams[1];

                event.homeTeamData = homeTeamData;
                event.awayTeamData = awayTeamData;

                if (!onlyTeamData) {
                    console.log('set date strings');
                    const formattedDateShort = getFormattedDate(event.dateEvent, true);
                    event.dateStringShort = formattedDateShort;
                    
                    const formattedDate = getFormattedDate(event.dateEvent);
                    event.dateString = formattedDate;
                    
                    event.localTime = getLocalTime(event.strTimestamp);
                }

                result.push(event);
            };

            return result;
            
        }

        console.log('SINGULAR TEAM DETAILS');
        console.log('checking home and away teams from session');

        const homeTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, dataArray.idHomeTeam);
        const awayTeamDataFromSession = this.getTeamDataFromSession(this.sessionLeagues, dataArray.idAwayTeam);
        const eventTeams = [homeTeamDataFromSession, awayTeamDataFromSession];
        const allUnknown = eventTeams.every(value => value === false);

        let newTeams = [];

        if (allUnknown) {

            console.log('none are known!');
            
            const fetches = [
                `lookupteam.php?id=${dataArray.idHomeTeam}`,
                `lookupteam.php?id=${dataArray.idAwayTeam}`
            ];

            const fetchData = await this.getMultipleJsonDatas(fetches);
            newTeams[0] = fetchData[0][0];
            newTeams[1] = fetchData[1][0];

        } else {

            for(let teamData of eventTeams) {
                
                if (teamData.failed) {
                    console.log('fetch extra team data');
                    const newTeamData = await this.getTeamData(teamData.idTeam);
                    teamData = newTeamData
                }

                newTeams.push(teamData);
            };

        }

        const homeTeamData = newTeams[0];
        const awayTeamData = newTeams[1];

        dataArray.homeTeamData = homeTeamData;
        dataArray.awayTeamData = awayTeamData;

        if (!onlyTeamData) {
                console.log('set date strings');
            const formattedDateShort = getFormattedDate(dataArray.dateEvent, true);
            dataArray.dateStringShort = formattedDateShort;
            
            const formattedDate = getFormattedDate(dataArray.dateEvent);
            dataArray.dateString = formattedDate;
            
            dataArray.localTime = getLocalTime(dataArray.strTimestamp);
        }

        return dataArray;
        
    }

    getTeamDataFromSession = (sessionDataArray, idTeam) => {

        if (!sessionDataArray) {
            return false;
        }

        const idExists = sessionDataArray.find(item => item.idTeam === idTeam);

        if (!idExists) {
            return { failed: true, idTeam: idTeam};
        }

        return idExists;
    }

    getTeamDetails = async (idTeam) => {

        console.log('get details');
        
        const fetches = [
            `eventslast.php?id=${idTeam}`, // prev games
            `eventsnext.php?id=${idTeam}`, // next games
            `lookup_all_players.php?id=${idTeam}`, // squad
        ];

        if (!this.sessionLeagues || this.sessionLeagues.length == 0) {
            console.log('no league teams in session');
            fetches.push(`lookupteam.php?id=${idTeam}`);
        }

        const fetchData = await this.getMultipleJsonDatas(fetches);

        console.log('multiple fetches performed');

        const jsonPrevGamesData = fetchData[0];
        const jsonNextGamesData = fetchData[1];
        const jsonSquadData = fetchData[2];
        let jsonTeamData;

        if (!this.sessionLeagues || this.sessionLeagues.length == 0) {
            jsonTeamData = fetchData[3][0];   
        } else if (this.sessionLeagues && this.sessionLeagues.length > 0) {
            console.log('getting team data from session');
            jsonTeamData = this.getTeamDataFromSession(this.sessionLeagues, idTeam);
        } else {
            jsonTeamData = fetchData[3][0];
        }

        // without session usage -> 3s
        // with session usage -> 300ms

        console.log('set prev games data');
        const prevGames = await this.setTeamData(jsonPrevGamesData, true);

        const sortedEvents = jsonNextGamesData.sort(this.sortByDate);
        console.log('set upcoming game data');
        const upcomingGame = await this.setTeamData(sortedEvents[0]);
        let squadArray = {};
        
        // Transform the squad array into an object with keys based on player positions
        jsonSquadData.forEach((player) => {

            // create position in array
            if (!squadArray[player.strPosition]) {
                squadArray[player.strPosition] = [];
            }

            squadArray[player.strPosition].push(player);
        });

        const result = {
            'team_data': jsonTeamData,
            'previous_games': prevGames,
            'up_next': upcomingGame,
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

        // console.log(result);
        
        for (const event of result) {

            if (Object.keys(gamesByDate).length == 3 && !Object.keys(gamesByDate).includes(event.dateEvent)) {
                continue;
            }
            
            const homeTeamData = await this.getTeamData(event.idHomeTeam);
            const awayTeamData = await this.getTeamData(event.idAwayTeam);
            event.homeTeamData = homeTeamData;
            event.awayTeamData = awayTeamData;

            const formattedDateShort = getFormattedDate(event.dateEvent, true);
            event.dateStringShort = formattedDateShort;
            
            const formattedDate = getFormattedDate(event.dateEvent);
            event.dateString = formattedDate;
            
            event.localTime = getLocalTime(event.strTimestamp);
            
            if (Object.keys(gamesByDate).includes(formattedDate)) {
                gamesByDate[formattedDate].push(event);    
            } else {
                gamesByDate[formattedDate] = [];
                gamesByDate[formattedDate].push(event);
            }

        };

        for (const key in gamesByDate) {
            const event = gamesByDate[key];
            gamesByDate[key] = this.sortByTime(event);
        }
                
        return gamesByDate;
    }

    sortByTime = (array) => {
        const result = array.sort((a, b) => {
            if (a['localTime'] < b['localTime']) return -1;
            if (a['localTime'] > b['localTime']) return 1;
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
        return jsonData[resultKey];
    }

    getMultipleJsonDatas = async (fetchUrls) => {

        const promises = fetchUrls.map(async (url) => {
            return await this.getJsonData(url);
        });

        return Promise.all(promises);
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