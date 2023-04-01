import apiClass from '../helpers/api.js';
import { getFormattedDate, getLocalTime } from '../helpers/utils.js';
import { sortByTime, sortByDate } from '../helpers/utils.js';

class TeamClass {

    constructor(api_key, sessionLeagues) {
        this.apiKey = api_key;
        this.sessionLeagues = sessionLeagues;
        this.API = new apiClass(this.apiKey);
    }

    getTeamData = async (idTeam) => {
        const jsonTeamData = await this.API.getJsonData(`lookupteam.php?id=${idTeam}`);

        if (jsonTeamData.failed) {
            return [];
        }

        return jsonTeamData[0];
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

    getHomeAndAwayTeamData = async (idHomeTeam, idAwayTeam) => {
                        
        const fetches = [
            `lookupteam.php?id=${idHomeTeam}`,
            `lookupteam.php?id=${idAwayTeam}`
        ];

        const fetchData = await this.API.getMultipleJsonDatas(fetches);

        console.log('home team: ', idHomeTeam);
        console.log('away team: ', idAwayTeam);

        return {'homeTeam': fetchData[0][0], 'awayTeam': fetchData[1][0]};
    }

    setTeamData = async (dataArray, onlyTeamData = false) => {

        if (Array.isArray(dataArray)) {

            console.log('MULTIPLE TEAM DETAILS');

            let result = [];
        
            for (const event of dataArray) {
                console.log('POPULATING TEAMS');
                let newEvent = await this.populateTeams(event, onlyTeamData);

                result.push(newEvent);
            };

            return result;
        }

        console.log('SINGULAR TEAM DETAILS');
        console.log('POPULATING TEAMS');
        return await this.populateTeams(dataArray, onlyTeamData);
    }

    populateTeams = async (dataArray, onlyTeamData = false) => {

        let newTeams = [];

        if (!this.sessionLeagues) {
            console.log('no league teams in session -> get data for both');
            const fetchData = await this.getHomeAndAwayTeamData(dataArray.idHomeTeam, dataArray.idAwayTeam);
            newTeams[0] = fetchData.homeTeam;
            newTeams[1] = fetchData.awayTeam;
            
        } else {
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

                console.log('one team unknown');
                for(let teamData of eventTeams) {
                    
                    if (teamData.failed) {
                        console.log('fetch extra team data');
                        const newTeamData = await this.getTeamData(teamData.idTeam);
                        teamData = newTeamData
                    }

                    newTeams.push(teamData);
                };

            }
        }

        console.log('attaching additional team data');
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

    listPreviousGamesByTeam = async (idTeam) => {

        const jsonPrevGamesData = await this.API.getJsonData(`eventslast.php?id=${idTeam}`);
        const prevGames = await this.setTeamData(jsonPrevGamesData);

        return prevGames;
    }

    getAllTeamDetails = async (idTeam) => {

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

        const fetchData = await this.API.getMultipleJsonDatas(fetches);

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
        // with service worker -> 3ms

        console.log('set prev games data');
        const prevGames = await this.setTeamData(jsonPrevGamesData);

        const sortedEvents = jsonNextGamesData.sort(this.sortByDate);
        console.log('set upcoming game data');
        const upcomingGame = await this.setTeamData(sortedEvents[0]);
        sortedEvents.shift();

        const upcomingGames = await this.setUpcomingEvents(sortedEvents);
        
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
            'upcoming_games': upcomingGames,
            'up_next': upcomingGame,
            'squad': squadArray
        }

        return result;
    }

     setUpcomingEvents = async (eventJsonData = false) => {

        if (!eventJsonData)
            eventJsonData = await this.API.getJsonData(`eventsnextleague.php?id=${this.leagueId}`);

        if (eventJsonData.failed)
            return [];
        
        let gamesByDate = {};
        const result = eventJsonData.sort(sortByDate);
        const populatedTeams = await this.setTeamData(result);
        
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


    getLeagueTeams = async () => {
        const jsonData = await this.API.getJsonData(`search_all_teams.php?l=English_Womens_Super_League`);
        return jsonData;
    }
};

export default TeamClass;