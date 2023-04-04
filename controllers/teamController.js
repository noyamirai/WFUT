import apiClass from '../helpers/api.js';
import { getFormattedDate, getLocalTime } from '../helpers/utils.js';
import { sortByTime, sortByDate } from '../helpers/utils.js';
import fs from 'fs';

class TeamClass {

    constructor(api_key, sessionLeagues, selectedTeam) {
        this.apiKey = api_key;
        this.sessionLeagues = sessionLeagues;
        this.leagueId = 4849;
        this.API = new apiClass(this.apiKey);
        this.selectedTeam = selectedTeam;
    }

    getTeamData = async (sessionDataArray, idTeam) => {

        let teamData;
        let foundObjectInSession;

        console.log('getting data for team id: ', idTeam);

        // Selected team -> no need to search
        if (this.selectedTeam && idTeam == this.selectedTeam.idTeam) {
            console.log('team id is selected team!');
            teamData = this.selectedTeam;

        } else {
            console.log('team id is not selected team');

            // Session available
            if (sessionDataArray) {

                // find team id in session
                foundObjectInSession = sessionDataArray.find(obj => obj.idTeam == idTeam);

                // team exists in current session 
                if (foundObjectInSession) {
                    console.log('found in session');
                    teamData = foundObjectInSession;
                }
            }

            // team unknown
            if (!teamData || teamData.length == 0) {
                console.log('nothing found -> fetch data');
                const jsonTeamData = await this.API.getJsonData(`lookupteam.php?id=${idTeam}`);

                if (jsonTeamData.failed) {
                    return [];
                }
                
                teamData = jsonTeamData[0];
                teamData.strTeamBadgeWebp = null;
            }

        }

        return teamData;
    }

    getHomeAndAwayTeamData = async (idHomeTeam, idAwayTeam) => {
                        
        const fetches = [
            `lookupteam.php?id=${idHomeTeam}`,
            `lookupteam.php?id=${idAwayTeam}`
        ];

        const fetchData = await this.API.getMultipleJsonDatas(fetches);

        let homeTeam = fetchData[0][0];
        let awayTeam = fetchData[1][0];

        homeTeam.strTeamBadgeWebp = null;
        awayTeam.strTeamBadgeWebp = null;

        return {'homeTeam': homeTeam, 'awayTeam': awayTeam };
    }

    setTeamData = async (dataArray) => {

        if (Array.isArray(dataArray)) {

            // console.log('MULTIPLE TEAM DETAILS');

            let result = [];
        
            for (const event of dataArray) {
                // console.log('POPULATING TEAMS');
                let newEvent = await this.populateTeams(event);

                result.push(newEvent);
            };

            return result;
        }

        // console.log('SINGULAR TEAM DETAILS');
        // console.log('POPULATING TEAMS');
        return await this.populateTeams(dataArray);
    }

    populateTeams = async (dataArray) => {

        let newTeams = [];

        // if (!this.sessionLeagues) {
        //     // console.log('no league teams in session -> get data for both');
        //     const fetchData = await this.getHomeAndAwayTeamData(dataArray.idHomeTeam, dataArray.idAwayTeam);
        //     newTeams[0] = fetchData.homeTeam;
        //     newTeams[1] = fetchData.awayTeam;
            
        // } else {
            // console.log('checking home and away teams from session');

            const homeTeamDataFromSession = await this.getTeamData(this.sessionLeagues, dataArray.idHomeTeam);
            const awayTeamDataFromSession = await this.getTeamData(this.sessionLeagues, dataArray.idAwayTeam);
            const eventTeams = [homeTeamDataFromSession, awayTeamDataFromSession];
            const allUnknown = eventTeams.every(value => value === false);

            if (allUnknown) {
                // console.log('both still unknown');
                const fetchData = await this.getHomeAndAwayTeamData(dataArray.idHomeTeam, dataArray.idAwayTeam);
                newTeams[0] = fetchData.homeTeam;
                newTeams[1] = fetchData.awayTeam;

            } else {

                // console.log('one team unknown');
                for(let teamData of eventTeams) {
                    
                    if (teamData.failed) {
                        // console.log('fetch extra team data');
                        const newTeamData = await this.getTeamData(teamData.idTeam);
                        teamData = newTeamData
                    }

                    newTeams.push(teamData);
                };

            }
        // }

        // console.log('attaching additional team data');
        const homeTeamData = newTeams[0];
        const awayTeamData = newTeams[1];

        dataArray.homeTeamData = homeTeamData;
        dataArray.awayTeamData = awayTeamData;

        // if (!onlyTeamData) {
            // console.log('set date strings');
            const formattedDateShort = getFormattedDate(dataArray.dateEvent, true);
            dataArray.dateStringShort = formattedDateShort;
            
            const formattedDate = getFormattedDate(dataArray.dateEvent);
            dataArray.dateString = formattedDate;
            
            dataArray.localTime = getLocalTime(dataArray.strTimestamp);
        // }

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

        let jsonTeamData = this.selectedTeam;

        const fetchData = await this.API.getMultipleJsonDatas(fetches);

        const jsonPrevGamesData = fetchData[0];
        const jsonNextGamesData = fetchData[1];
        const jsonSquadData = fetchData[2];

        const prevGames = await this.setTeamData(jsonPrevGamesData);

        const sortedEvents = jsonNextGamesData.sort(this.sortByDate);
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
};

export default TeamClass;