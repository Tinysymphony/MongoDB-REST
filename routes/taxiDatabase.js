var mongodbUrl = 'mongodb://127.0.0.1:27017/taxidata';
var collection = 'taxi';
var pgUrl = 'postgres://justcj:vag@192.168.1.104:5432/testdb';
// var mongo = require('../lib/mongoCRUD').init(url);
var mongoose = require('../lib/mongooseCRUD').init(mongodbUrl, collection);
var pg = require('../lib/pgCRUD').init(pgUrl);
var express = require('express');
var path = require('path');
var fs = require('fs');
var async = require('async');
var formidable = require('formidable');

var TaxiDatabase = express.Router();

var saveDirectory = path.resolve(__dirname, '../dataFiles');

TaxiDatabase.get('/', function (req, res) {
    if(!req.body.query) { 
        res.send("Pleas give correct query conditions!\n");
        return;
    }
    mongoose.queryData(req.body.query, function(err, results){
        if(err) { res.send(err); return; }
        res.send(results.length + " record(s) is/are found. \n" + results + "\n");
    });
});

TaxiDatabase.post('/', function (req, res) {
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

TaxiDatabase.post('/file',  function (req, res, next){
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = saveDirectory;
    form.keepExtensions = false;
    form.type = 'multipart';
    form.multiples = true;

    async.waterfall([
        //save the upload files to tmp directory.
        function(callback){
            var filelist = [];
            form.parse(req, function (err ,fields, files){
                if(err) { callback(err); return; }
                // console.log(files);

                if(!(files.recordFiles instanceof Array)){
                    //for single file
                    var fileSavePath = path.join(saveDirectory, files.recordFiles.name);
                    fs.rename(files.recordFiles.path, fileSavePath, function(err){
                        if(err) { cb(err); return; }
                        filelist.push(fileSavePath);
                        callback(null, filelist);
                    });
                } else {
                    //for multiple files
                    async.each(files.recordFiles, function(file, cb){
                        var fileSavePath = path.join(saveDirectory, file.name);
                        fs.rename(file.path, fileSavePath, function(err){
                            if(err) { cb(err); return; }
                            filelist.push(fileSavePath);
                            cb();
                        });
                    },  function(err){
                        if(err) { callback(err); return; }
                        callback(null, filelist);
                    });           
                }

            });
        },
        //call save data to mongodb
        function(filelist, callback){
            mongoose.insertFiles(filelist, function (err, recordCounter){
                if(err) callback(err);
                callback(null, recordCounter);
            });
        }
    ], function(err, recordCounter){
        if(err instanceof Array) {
            res.send("Cannot save the following file(s):" + err.toString()); 
            return;
        }
        if(err) { res.send(err); return ;}
        res.send("Success : " + recordCounter + " records have been inserted.\n");
    });

});


TaxiDatabase.post('/zip', function (req, res, next){

});

TaxiDatabase.put('/', function (req, res, next){
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

TaxiDatabase.delete('/', function (req, res, next){
    if(!req.body.delete) { 
        res.send("Pleas give correct delete conditions!\n");
        return;
    }
    mongoose.deleteData(req.body.delete, function (err, results){
        res.send(results + "\n");
    });
});

TaxiDatabase.get('/query', function (req, res, next){
    var time = {
        upperBound: req.query.timeUB || '2020-1-1',
        lowerBound: req.query.timeLB || '2000-1-1'
    };
    var loc = {
        longtitudeUpperBound: req.query.longtitudeUB || 180,
        longtitudeLowerBound: req.query.longtitudeLB || -180,
        latitudeUpperBound: req.query.latitudeUB || 90,
        latitudeLowerBound: req.query.latitudeLB || -90
    };
    pg.queryByLocationAndTime(loc, time, function (err, records){
        if(err) return res.send(err);
        res.send(records);
    });

});

module.exports = TaxiDatabase;
