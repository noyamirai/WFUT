import express from 'express';
const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

dashRouter.get('/', async (req, res) => {
    const teams = await api.getLeagueTeams();

    res.render('layout', {
        'view': 'home',
        'allData': {leagueTeams: teams}
    });
});

export default dashRouter;