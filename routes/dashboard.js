import express from 'express';
const dashRouter = express.Router();

import dotenv from 'dotenv';
dotenv.config();

import ApiClass from '../helpers/api.js';
const api = new ApiClass(process.env.API_KEY);

dashRouter.get('/', async (req, res) => {
    const events = await api.getUpcomingEvents();
    console.log(events);

    res.render('layout', {
        'view': 'home',
        'event': events
    });
});

export default dashRouter;