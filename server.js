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
import compression from 'compression';

const revManifest = JSON.parse(fs.readFileSync('./static/rev-manifest.json'));

dotenv.config();

import setManifestConfig from './middleware/manifestConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 9000;
const sessionLength = (1000 * 60 * 60 * 24) * 7; // 1 day

app.locals.fs = fs;
app.locals.revManifest = revManifest;

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
app.use(compression());

app.use(express.static('static'));
app.use('/static', express.static(__dirname + '/static/'));
app.use('/', express.static(__dirname + '/'));

// ROUTES
app.use('/', dashRouter);
app.use('/team-details', teamDetailsRouter);

app.get('/offline', (req, res) => {

    res.render('layout', {
        'view': 'offline',
        'bodyClass': 'error error--offline',
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

// define a route that returns multiple image paths
app.get('/teamlogopaths', (req, res) => {
    const imagePaths = [
        '/static/teams/team_logo-140218.png',
        '/static/teams/team_logo-140219.png',
        '/static/teams/team_logo-140220.png',
        '/static/teams/team_logo-140222.png',
        '/static/teams/team_logo-140224.png',
        '/static/teams/team_logo-140225.png',
        '/static/teams/team_logo-140226.png',
        '/static/teams/team_logo-140227.png',
        '/static/teams/team_logo-140228.png',
        '/static/teams/team_logo-140229.png',
        '/static/teams/team_logo-140532.png',
        '/static/teams/team_logo-140540.png',
        '/static/teams/team_logo-140218.webp',
        '/static/teams/team_logo-140219.webp',
        '/static/teams/team_logo-140220.webp',
        '/static/teams/team_logo-140222.webp',
        '/static/teams/team_logo-140224.webp',
        '/static/teams/team_logo-140225.webp',
        '/static/teams/team_logo-140226.webp',
        '/static/teams/team_logo-140227.webp',
        '/static/teams/team_logo-140228.webp',
        '/static/teams/team_logo-140229.webp',
        '/static/teams/team_logo-140532.webp',
        '/static/teams/team_logo-140540.webp'
    ];

    res.send(imagePaths);
});

app.get('*', (req, res) => {

    res.render('layout', {
        'view': '404',
        'bodyClass': 'error',
    });
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});