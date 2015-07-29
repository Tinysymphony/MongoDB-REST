var url = 'mongodb://127.0.0.1:27017/mapdata';
var collection = 'mapdata';
var mongo = require('../lib/mongoCRUD');//.init(url, collection);
// var mongoose = require('../lib/mongooseCRUD').init(url, collection);
var express = require('express');
var path = require('path');
var fs = require('fs');
var async = require('async');

var MapDatabase = express.Router();

MapDatabase.get('/china', function (req, res, next){
    mongo.queryData({}, url, 'china', function (err, result){
        if(err) { res.send(err); return; }
        res.send(result);
    });
});


MapDatabase.get('/province/:id', function (req, res, next){

});

MapDatabase.get('/province/', function (req, res, next){

});

MapDatabase.get('/', function (req, res, next){

});

MapDatabase.get('/', function (req, res, next){

});

MapDatabase.get('/', function (req, res, next){

});

module.exports = MapDatabase;
