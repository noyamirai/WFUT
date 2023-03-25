import express from 'express';
import sessionManager from '../middleware/sessionManager.js';
const teamDetailsRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

teamDetailsRouter.get('/:teamId', async (req, res) => {

    const teamDetails = api.getTeamDetails(req.params.teamId);
    console.log(teamDetails);

    res.render('layout', {
        'view': 'team-details'
    });

});

export default teamDetailsRouter;