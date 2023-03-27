import express from 'express';
const teamDetailsRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';

teamDetailsRouter.get('/:teamId', async (req, res) => {

    console.log('teams in session: ', req.session.league_teams);

    const api = new ApiClass(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    const teamDetails = await api.getTeamDetails(req.params.teamId);
    console.log('DONE');

    if (!req.session.league_teams) {
        const teams = await api.getLeagueTeams();
        req.session.league_teams = teams;
    }

    res.render('layout', {
        'view': 'team-details',
        'teamDetails': teamDetails
    });


});

export default teamDetailsRouter;