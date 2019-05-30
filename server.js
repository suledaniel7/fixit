const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');

const router = require('./server/router');

const app = express();

mongoose.connect('mongodb://127.0.0.1/fixit');

app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(express.static(__dirname+'/public/'));
app.use('/', router);

app.all('*', function(req, res){
    let route = req.url;
    res.status(404).render('not-found', {route: route});
});

app.listen(8090, function(){
    console.log("Server running at http://127.0.0.1:8090");
});