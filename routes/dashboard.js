import express from 'express';
const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

// sessionManager.hasSession
dashRouter.get('/', async (req, res) => {
    let teams = [];
    let upcomingGames = [];
    let homeData = [];

    if (req.session.home_data) {
        console.log('data exists');
        homeData = req.session.home_data;

    } else {
        console.log('No home data in session yet! Fetch and save');
        teams = await api.getLeagueTeams();
        upcomingGames = await api.getUpcomingEvents();

        homeData.push({
            partial: 'teamlist',
            className: 'teamlist',
            data: teams
        });

        homeData.push({
            partial: 'gamelist',
            className: 'game',
            data: upcomingGames
        });

        // TODO : fetch team badges + acronyms
        req.session.home_data = homeData;
    }

    res.render('layout', {
        'view': 'home',
        'allData': homeData
    });
});

// waiting for server response time
// api itself -> 200ms
// nothing -> 200ms
// with req.session -> 30ms
// without service worker or with service worker on intial load -> 70-200ms
// with service worker -> 2ms 

// req.session usage more bc i dont want to perform multiple calls 

export default dashRouter;