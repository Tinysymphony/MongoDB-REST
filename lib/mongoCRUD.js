var async = require('async');
var client = require('mongodb').MongoClient;

var SLICE_SIZE = 1000;
var collection = '';
var url = '';

var MongoREST = new Object();

function TaxiRecord(record){
    this.t = new Date(record.t);
    this.l = record.l;
    this.n = record.n;
    this.d = record.d || -1;
    this.i = record.i || false;
    this.v = record.v || 0;
}

MongoREST.init = function(initUrl, initCollection){
    // this.url = initUrl;
    var url = initUrl;
    var collection = initCollection;
    return this;
};

MongoREST.queryData = function(query, queryUrl, queryCollection, callback) {
    client.connect(queryUrl, function (err, db){
        if(err) { callback(err); return; }
        var col = db.collection(queryCollection);
        col.find(query).toArray(function (err, docs){
            if(err){
                db.close();
                callback(err);
            }
            db.close();
            callback(null, docs);
        });
    });
};

MongoREST.insertTaxiRecord = function(recordIn ,callback){
    if(!validateRecord(recordIn)) { callback("Record in wrong format.\n"); return; }
    client.connect(url, function (err, db){
        if(err) { callback(err); return; }
        var record = new TaxiRecord(recordIn);
        var col = db.collection(collection);
        col.insert(record, function(err, result){
            if(err) { 
                callback(err);
                db.close(); 
                return; 
            }
            db.close();
            console.log(result.toString());
            callback(null, "Insert Success.\n");
        });
    });
};

MongoREST.insertTaxiRecordArray = function(records, callback){
    var docs = [];
    for(var index in records){
        if(!validateRecord(records[index])) { callback("All of records are not in correct format.\n"); return; }
        docs.push(new TaxiRecord(records[index]));
    }
    client.connect(url, function (err, db){
        if(err) { callback(err); return; }
        var col = db.collection(collection);
        col.insert(docs, function(err, result){
            if(err) { 
                callback(err);
                db.close(); 
                return; 
            }
            console.log(result.toString());
            callback(null, "Insert Success.\n");
        });
    });
};

MongoREST.insertTaxiFile = function(){};
MongoREST.insertTaxiFileArray = function(){};

MongoREST.updateTaxiRecord = function(query, update, callback){
    client.connect(this.url, function (err, db){
        if(err) { callback(err); return; }
        var col = db.collection(collection);
        col.insert(record, function(err, docs){
            if(err) { 
                callback(err);
                db.close(); 
                return; 
            }
            db.close(); 
            console.log("One record is inserted");
            callback(null, "Insert Success.\n");
        });
    });
};

MongoREST.deleteData = function(){};

function validateRecord(record){
    if(!record.n || !record.t || !record.l)
        return false;
    if(!validateNumber(record.n))
        return false;
    if(!validateTime(record.t))
        return false;
    if(!validateLocation(record.l))
        return false;
    if(record.i && !validatePassenger(record.i))
        return false;
    if(record.d && !validateDirection(record.d))
        return false;
    if(record.v && !validateSpeed(record.v))
        return false;
    return true;

    function validateNumber(number){
        return true;
    }

    function validateTime(time){
        var data = new Date(time);
        if(data == "Invalid Date")
            return false;
        return true;
    }

    function validateLocation(location){
        if(!(location instanceof Array && location.length == 2))
            return false;
        if(typeof location[0] != 'number' || typeof location[1] != 'number')
            return false;
        if(location[0] > 180 || location[0]< -180 || location[1] > 90 || location[1] < -90)
            return false;
        return true;
    }

    function validatePassenger(passenger){
        if(!passenger instanceof Boolean)
            return false;
        return true;
    }

    function validateDirection(direction){
        var dir = [0, 1, 2, 3, 4, 5, 6, 7];
        if(dir.indexOf(direction) == -1)
            return false;
        return true;
    }

    function validateSpeed(speed){
        if(!(speed instanceof Number && speed >= 0))
            return false;
        return true;
    }
}

module.exports = MongoREST;