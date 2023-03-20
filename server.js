const express = require('express');
const fs = require('fs');
require('dotenv').config();

// import Fotmob from 'fotmob';
// const fotmob = new Fotmob();

const app = express();
const port = process.env.PORT || 3000;

// SET TEMPLATE ENGINE
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use('/public', express.static(__dirname + '/public/'));
app.use('/styles', express.static(__dirname + '/public/styles/'));
app.use('/images', express.static(__dirname + '/public/images/'));

app.locals.fs = fs;

// ROUTES
app.use('/', require('./routes/dashboard'));

app.get('*', (req, res) => {
    // let league = await fotmob.getLeague("9227", "overview", "league", "Netherlands/Amsterdam")

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