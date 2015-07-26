var url = 'mongodb://127.0.0.1:27017/node8';
var collection = 'taxi';
var mongo = require('../lib/mongoCRUD').init(url);
var mongoose = require('../lib/mongooseCRUD').init(url, collection);
var express = require('express');
var path = require('path');
var fs = require('fs');
var async = require('async');

var formidable = require('formidable');

var database = express.Router();

var saveDirectory = path.resolve(__dirname, '../dataFiles');

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
                console.log(fields);
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
        if(err) { res.send(err.toString() + "\n"); return ;}
        if(err instanceof Array) {
            res.send("Cannot save the following file(s):\n" + err.toString() + "\n"); 
            return;
        }
        res.send("Success : " + recordCounter + " records have been inserted.\n");
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
