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
    
    console.log('FETCH HEREE');

    teams = await api.getLeagueTeams();

    res.render('layout', {
        'view': 'home',
        'allData': {leagueTeams: teams}
    });
});

dashRouter.get('/health', (req, res) => {

    res.json({'success': true})

});

export default dashRouter;