import express from 'express';
import sessionManager from '../middleware/sessionManager.js';
const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

dashRouter.get('/', sessionManager.hasSession, async (req, res) => {
    let teams = [];
    
    // cookies not supported/allowed
    if (!req.session.cookie_allowed) {
        console.log('FETCH ALL');
        teams = await api.getLeagueTeams();        
    } else {

        if (req.session.leagueTeams) {
            console.log('teams in storage');
            teams = req.session.leagueTeams;
        } else {
            console.log('FETCH');
            teams = await api.getLeagueTeams();

            req.session.leagueTeams = teams;
            console.log('fetched teams');
        }

    }

    res.render('layout', {
        'view': 'home',
        'allData': {leagueTeams: teams}
    });
});

export default dashRouter;