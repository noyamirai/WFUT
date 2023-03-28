import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dashRouter from './routes/dashboard.js';
import teamDetailsRouter from './routes/team-details.js';
import dotenv from 'dotenv';
import session from 'express-session';
import cacheManager from './middleware/cacheManager.js';
dotenv.config();

import setManifestConfig from './middleware/manifestConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9000;
const sessionLength = (1000 * 60 * 60 * 24) * 7; // 1 day

app.locals.fs = fs;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(setManifestConfig);
app.use(cookieParser());
app.use(session({
    name: 'wfutsession',
    secret: "wfutsecretsessiondata",
    saveUninitialized:true,
    cookie: { maxAge: sessionLength },
    resave: false
}));

app.use(cacheManager.setCache);

app.use(express.static('static'));
app.use('/static', express.static(__dirname + '/static/'));
app.use('/src', express.static(__dirname + '/src/'));
app.use('/', express.static(__dirname + '/'));

// ROUTES
app.use('/', dashRouter);
app.use('/team-details', teamDetailsRouter);

app.get('/offline', (req, res) => {

    res.render('layout', {
        'view': 'offline',
        'bodyClass': 'error',
    });
});

import manifestController from './controllers/manifestController.js';

app.get('/manifest', (req, res) => {
    const ManifestController = new manifestController( req.app.locals );

    res.set('Content-Type', 'application/json');
    let manifest = ManifestController.createManifest();
    res.status(200).json(manifest);
    res.end();
});


app.get('*', (req, res) => {

    res.render('layout', {
        'view': 'blanco',
        'bodyClass': 'error',
        'partial': './partials/message', 
        'messageTitle': 'Oops!', 
        'messageSubTitle': 'Page not found'
    });
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});