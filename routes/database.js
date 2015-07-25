var url = 'mongodb://127.0.0.1:27017/node6';
var collection = 'taxi';
var mongo = require('../lib/mongoCRUD').init(url);
var mongoose = require('../lib/mongooseCRUD').init(url, collection);
var express = require('express');
var path = require('path');
var fs = require('fs');
var async = require('async');

var formidable = require('formidable');

var database = express.Router();

var tmpDirection = path.resolve(__dirname, '../dataFiles');

database.get('/taxi', function (req, res) {
    if(!req.body.query) { 
        res.send("Pleas give correct query conditions!\n");
        return;
    }
    mongoose.queryData(req.body.query, function(err, results){
        if(err) { res.send(err); return; }
        res.send(results.length + " record(s) is/are found. \n" + results + "\n");
    });
});

database.post('/taxi', function (req, res) {
    // console.log(req.body , req.files);
    var data = req.body;
    switch (data.dataType) {
        case "record":
            mongoose.insertRecord(data.record, function (err, results){
                if(err) { res.send(err); return; }
                res.send(results + "\n");
            });
            break;
        case "records":
            mongoose.insertRecordArray(data.records, function(err, results){
                if(err) { res.send(err); return; }
                res.send(results + "\n");
            });
            break;
        case "binaryFile":
            mongoose.insertFile(data.binaryFile, function(err, results){
                if(err) { res.send(err); return; }
                res.send(results + "\n");
            });
            break;
        case "zip":
            mongoose.insertFileArray(data.zip, function(err, results){
                if(err) { res.send(err); return; }
                res.send(results + "\n");
            });
            break;
        default:
            res.send("Please upload data in right form!\n");
            break;
    }
});

database.post('/taxi/file',  function (req, res, next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = tmpDirection;
    form.keepExtensions = false;
    form.type = 'multipart';

    form.parse(req, function (err ,fields, files){
        if(err) { res.send(err.toString() + '\n'); return; }
        console.log(files.fulAvatar.type);
        fs.rename(files.fulAvatar.path, "dataFiles/tiny-" + new Date(), function(err){
            if(err) { res.send(err.toString() + '\n'); return; }
            res.send("ok!");
        });
    });

});

database.put('/taxi', function (req, res, next){
    if(!(req.body.query && req.body.update)) { 
        res.send("Pleas give correct update conditions and opeartions!\n");
        return;
    }
    var options = { multi: true };
    mongoose.updateData(req.body.query, req.body.update, options, function (err, results){
        if(err) { res.send(err); return; }
        res.send(results+ "\n");
    });
});

database.delete('/taxi', function (req, res, next){
    if(!req.body.delete) { 
        res.send("Pleas give correct delete conditions!\n");
        return;
    }
    mongoose.deleteData(req.body.delete, function (err, results){
        res.send(results + "\n");
    });
});

module.exports = database;
