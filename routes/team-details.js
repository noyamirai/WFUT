import express from 'express';
const teamDetailsRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import TeamController from '../controllers/teamController.js';
import HomeController from '../controllers/homeController.js';

const menuItems = {
    'form': 'Team form',
    'upcoming': 'Fixtures',
    'squad': 'Squad'
}

teamDetailsRouter.get(['/:idTeam', '/:idTeam/form'], async (req, res) => {
    console.log('--- TEAM FORM VIEW ---');

    console.log('teams in session: ', req.session.league_teams ? true : false);
    console.log('selected team in session: ', req.session.selectedTeam ? true : false);

    const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    let teamDetails;

    if (req.session.selectedTeam && req.session.selectedTeam.team_data.idTeam == req.params.idTeam) {
        console.log('GET FROM SESSION');
        teamDetails = req.session.selectedTeam;

    } else {
        console.log('FETCH ALL TEAM DETAILS');
        teamDetails = await teamController.getAllTeamDetails(req.params.idTeam);
        console.log('DONE');
        console.log('RESET TEAM SELECTION SESSION DATA');
        req.session.selectedTeam = teamDetails;
    }

    if (!req.session.league_teams) {
        const teams = await teamController.getLeagueTeams();
        req.session.league_teams = teams;
    }

    req.app.locals.activeItem = 'form';

    res.render('layout', {
        'view': 'team-details',
        'teamDetails': teamDetails,
        'menuItems': menuItems,
    });

});

teamDetailsRouter.get('/:idTeam/upcoming', async (req, res) => {
    console.log('--- FIXTURES VIEW ---');

    console.log('teams in session: ', req.session.league_teams ? true : false);
    console.log('selected team in session: ', req.session.selectedTeam ? true : false);

    const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    const homeController = new HomeController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    let teamDetails;

    if (req.session.selectedTeam && req.session.selectedTeam.team_data.idTeam == req.params.idTeam) {
        console.log('GET FROM SESSION');
        teamDetails = req.session.selectedTeam;

    } else {
        console.log('FETCH ALL TEAM DETAILS');
        teamDetails = await teamController.getAllTeamDetails(req.params.idTeam);
        console.log('DONE');
        console.log('RESET TEAM SELECTION SESSION DATA');
        req.session.selectedTeam = teamDetails;
    }

    if (!req.session.league_teams) {
        const teams = await teamController.getLeagueTeams();
        req.session.league_teams = teams;
    }

    req.app.locals.activeItem = 'upcoming';

    res.render('layout', {
        'view': 'team-details',
        'teamDetails': teamDetails,
        'menuItems': menuItems,
    });

});

teamDetailsRouter.get('/:idTeam/squad', async (req, res) => {
    console.log('--- SQUAD VIEW ---');

    console.log('teams in session: ', req.session.league_teams ? true : false);
    console.log('selected team in session: ', req.session.selectedTeam ? true : false);

    const teamController = new TeamController(process.env.API_KEY, (req.session.league_teams ? req.session.league_teams : undefined));
    let teamDetails;

    if (req.session.selectedTeam && req.session.selectedTeam.team_data.idTeam == req.params.idTeam) {
        console.log('GET FROM SESSION');
        teamDetails = req.session.selectedTeam;

    } else {
        console.log('FETCH ALL TEAM DETAILS');
        teamDetails = await teamController.getAllTeamDetails(req.params.idTeam);
        console.log('DONE');
        console.log('RESET TEAM SELECTION SESSION DATA');
        req.session.selectedTeam = teamDetails;
    }

    if (!req.session.league_teams) {
        const teams = await teamController.getLeagueTeams();
        req.session.league_teams = teams;
    }

    console.log(teamDetails.squad);
    req.app.locals.activeItem = 'squad';

    console.log(teamDetails.squad);

    res.render('layout', {
        'view': 'team-details',
        'teamDetails': teamDetails,
        'menuItems': menuItems,
    });

});

export default teamDetailsRouter;