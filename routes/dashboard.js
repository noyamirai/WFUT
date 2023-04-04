import express from 'express';
import fs from 'fs';

const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import TeamController from '../controllers/teamController.js';
import LeagueController from '../controllers/leagueController.js';

dashRouter.get('/', async (req, res) => {

    let homeData = [];

    if (req.session.home_data) {
        console.log('data exists');
        homeData = req.session.home_data;

    } else {
        console.log('No home data in session yet! Fetch and save');

        const leagueController = new LeagueController(process.env.API_KEY);
        let leagueTeams = leagueController.listLeagueTeamsFromFile();

        if (leagueTeams.length == 0)
            leagueTeams = await leagueController.listLeagueTeamsFromApi();

        req.session.league_teams = leagueTeams;

        const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined), null);
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

    res.render('layout', {
        'view': 'home',
        'allData': homeData
    });
});

export default dashRouter;