import express from 'express';
const teamDetailsRouter = express.Router();

import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

import TeamController from '../controllers/teamController.js';
import LeagueController from '../controllers/leagueController.js';

const menuItems = {
    'form': 'Team form',
    'upcoming': 'Fixtures',
    'squad': 'Squad'
}

teamDetailsRouter.get(['/:idTeam', '/:idTeam/form','/:idTeam/upcoming','/:idTeam/squad' ], async (req, res) => {
    const leagueController = new LeagueController(process.env.API_KEY);

    if (!req.session.league_teams) {
        const teams = await leagueController.getLeagueTeamsFromApi();
        req.session.league_teams = teams;
    }

    console.log('selected team in session: ', req.session.selectedTeam ? true : false);

    const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    let teamDetails;

    if (req.session.selectedTeam && req.session.selectedTeam.team_data.idTeam == req.params.idTeam) {
        console.log('GET FROM SESSION');
        teamDetails = req.session.selectedTeam;

    } else {
        teamDetails = await teamController.getAllTeamDetails(req.params.idTeam);
        req.session.selectedTeam = teamDetails;
    }

    const activeSection = path.basename(req.path);
    console.log(activeSection);
    req.app.locals.activeItem =  (menuItems[activeSection] ? activeSection : 'form');

    res.render('layout', {
        'view': 'team-details',
        'teamDetails': teamDetails,
        'menuItems': menuItems,
    });

});


export default teamDetailsRouter;