var mapdata = 'mongodb://127.0.0.1:27017/mapdata';
var collection = 'mapdata';
var mongo = require('../lib/mongoCRUD');//.init(url, collection);
// var mongoose = require('../lib/mongooseCRUD').init(url, collection);
var express = require('express');
var path = require('path');
var fs = require('fs');
var url = require('url');
var async = require('async');

var MapDatabase = express.Router();

MapDatabase.get('/china', function (req, res, next){
    getChinaMap(function(err, result){
        if(err) { res.send(err); return; }
        res.send(result);
    });
});

MapDatabase.get('/province', function (req, res, next){
    // var id = req.params.id;
    var id = req.query.id;
    var name = req.query.name;
    if(id) {
        getProvinceById(id, function(err, result){
            if(err) { res.send(err); return; }
            res.send(result);
        });
    } else if(name){
        getProvinceByName(name, function(err, result){
            if(err) { res.send(err); return; }
            res.send(result);
        });
    } else {
        res.send("Please input id or name of province to get map data.\n");
    }
});

MapDatabase.get('/county', function (req, res, next){
    var id = req.query.id;
    var name = req.query.name;
    var query = new Object();
    if(id)
        query.id = id + "00"; //districs save the county id with 00 appended 
    if(name){
        query["properties.name"] = name;
    }
    mongo.queryData(query, mapdata, 'county', function (err, result){
        if(err || result.length == 0){
            res.send("Cannot find requested data.\n");
            return;
        }
        if(err) { res.send(err); return; }
        var county = {
            "type": "FeatureCollection" ,
            "features": result
        }
        res.send(county);
    });  
});

MapDatabase.get('/district', function (req, res, next){
    var id = req.query.id;
    var name = req.query.name;
    var query = new Object();
    if(id)
        query["properties.id"]= id;
    if(name){
        query["properties.name"] = name;
    }
    mongo.queryData(query, mapdata, 'county', function (err, result){
        if(err || result.length == 0){
            res.send("Cannot find requested data.\n");
            return;
        }
        if(err) { res.send(err); return; }
        res.send(result.pop());
    });  
});

MapDatabase.get('/', function (req, res, next){

});

var getChinaMap = function (callback) {
    mongo.queryData({}, mapdata, 'china', function (err, result){
        if(err || result.length == 0){
            return callback("Cannot get map data of China.");
        }
        return callback(null, result.pop());
    });
}

var getProvinceById = function(id, callback) {
    mongo.queryData({"id": id}, mapdata, 'province', function (err, result){
        if(err || result.length == 0){
            return callback("Cannot get province map data.")
        }      
        return callback(null, result.pop());
    });
}

var getProvinceByName = function(name, callback) {
    getChinaMap(function(err, china){
        if(err) return callback(err);
        var proArray = china["features"];
        var targetId = 0;
        for(var i = 0; i<proArray.length; i++){
            if(proArray[i].properties.name == name)
                targetId = proArray[i].properties.id;
        }
        if(targetId == 0) return callback("Cannot get province map data.");
        getProvinceById(targetId, function(err, result){
            if(err) return callback(err);
            return callback(null, result);
        });
    });
}

module.exports = MapDatabase;
