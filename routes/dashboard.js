import express from 'express';
import sessionManager from '../middleware/sessionManager.js';
const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

// sessionManager.hasSession
dashRouter.get('/', async (req, res) => {
    let teams = [];
    let homeData = {};

    if (req.session.home_data) {
        console.log('data exists');
        teams = req.session.home_data.leagueTeams;
        homeData.leagueTeams = teams;
    } else {
        console.log('No home data in session yet! Fetch and save');
        teams = await api.getLeagueTeams();
        homeData.leagueTeams = teams;
        req.session.home_data = homeData;
    }

    
    res.render('layout', {
        'view': 'home',
        'allData': homeData
    });
});

export default dashRouter;