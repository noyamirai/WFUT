// const express = require('express');
// const fs = require('fs');
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dashRouter from './routes/dashboard.js';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// hey

const app = express();
const port = process.env.PORT || 3000;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('static'));
app.use('/static', express.static(__dirname + '/static/'));

app.locals.fs = fs;

// ROUTES
app.use('/', dashRouter);

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