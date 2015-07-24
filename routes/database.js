var url = 'mongodb://127.0.0.1:27017/node6';
var mongo = require('../lib/mongoCRUD').init(url);

var express = require('express');
var database = express.Router();

//curl -X GET -H 'Content-Type: application/json' -d '{"query" :{"v":43, "d":4,"i":true}}' http://localhost:3000/db/taxi
database.get('/taxi', function (req, res) {
    if(!req.body) { 
        res.send("Pleas give correct query conditions!");
        return;
    }
    mongo.queryData(req.body.query, function(err, result){
        if(err) { res.send(err); return; }
        res.send(result[0]);
    });
});

//curl -X POST -H 'Content-Type: application/json' -d '{"dacord": {"t":"2015/5/5-12:12", "n":"wytiny","l":[120,28] ,"i":true}}' http://localhost:3000/db/taxi

//curl -X POST -H 'Content-Type: application/json' -d '{"dataType" :"records", "records": [{"t":"2015/5/5-12:12", "n":"tinys","l":[120,28] ,"i":true},{"t":"2016/1/1", "i":false, "n":"tinys", "l":[120,29]}] }' http://localhost:3000/db/taxi


database.post('/taxi', function (req, res) {
    var data = req.body;
    switch (data.dataType) {
        case "record":
            mongo.insertRecord(data.record, function (err, result){
                if(err) { res.send(err); return; }
                res.send(result);
            });
            break;
        case "records":
            mongo.insertRecordArray(data.records, function(err, result){
                if(err) { res.send(err); return; }
                res.send(result);
            });
            break;
        case "binaryFile":
            mongo.insertFile(data.binaryFile, function(err, result){
                if(err) { res.send(err); return; }
                res.send(result);
            });
            break;
        case "zip":
            mongo.insertFileArray(data.zip, function(err, result){
                if(err) { res.send(err); return; }
                res.send(result);
            });
            break;
        default:
            res.send("Please upload data in right form!");
            break;
    }
});

database.put('/taxi', function (req, res, next){
    if(!(req.body.query && req.body.update)) { 
        res.send("Pleas give correct update conditions and opeartions!");
        return;
    }
    mongo.updateData(req.body.query, req.body.update, function (err, result){
        if(err) { res.send(err); return; }
        res.send(result);
    });
});

database.delete('/taxi', function (req, res, next){
    if(!req.body) { 
        res.send("Pleas give correct delete conditions!");
        return;
    }
    mongo.deleteData(req.body.delete, function (err, result){
        res.send(result);
    });
});

module.exports = database;
