'use strict';
var express = require("express"),
    routes = require("./app/routes/index.js"),
    mongo = require("mongodb").MongoClient;

var app = express();


mongo.connect('mongodb://localhost:27017/votingApp', function (err, db) {
    
    if(err) throw err;
    
    var bodyParse = require("body-parser");
    app.use(bodyParse.json());
    app.use(bodyParse.urlencoded({ extended: true }));
    
    routes(app, db);
    
    app.use('/', express.static(process.cwd() + '/public'));
    app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
    
    app.listen(process.env.PORT, process.env.IP, function(){
        console.log("Listening on port " + process.env.PORT + "...");
    });
});