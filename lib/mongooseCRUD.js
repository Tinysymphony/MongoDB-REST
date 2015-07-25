var async = require('async');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var MongooseREST = new Object();
var url = '';
var TaxiRecord = null;

var numberValidator = [validateNumber, "Number is invalid."];
var timeValidator = [validateTime, "Time is invalid. Format: year/month/day-hour/min/sec"];
var locationValidator = [validateLocation, "Location is invalid. Format: [longtitude(-180~180), latitude(-90~90)]"];
var passengerValidator = [validatePassenger, "Passenger is invalid. Format: Boolean"];
var directionValidator = [validateDirection, "Direction is invalid. Format: Integer of [0~7]"];
var speedValidator = [validateSpeed, "Speed is invalid. Format: Number >= 0"];

var taxiSchema = new Schema({
    t: {type: Date, required: true, validate: timeValidator},
    l: {type: [Number], required: true, validate: locationValidator},
    n: {type: String, required: true, validate: numberValidator},
    d: {type: Number, required: true, validate: directionValidator},
    i: {type: Boolean, required: true, validate: passengerValidator},
    v: {type: Number, required:true, validate: speedValidator}
}, {versionKey: false});

/*---------Validators Defination Start---------*/
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
    if(speed < 0)
        return false;
    return true;
}

/*---------Validators Defination End---------*/

//initialize module
MongooseREST.init = function(initUrl, collection){
    url = initUrl;
    mongoose.connect(url);
    TaxiRecord = mongoose.model("TaxiRecord", taxiSchema, collection);
    return this;
}

MongooseREST.insertRecord = function(record, callback){
    console.log("single");
    TaxiRecord.create(record, function(err, doc){
        if(err) { callback(err.toString() + "\n"); return; }
        doc.save(function(err, result){
            if(err) { callback(err); return; }
            callback(null, "A record is inserted with id:" + result._id + "\n");
        });
    });
};

MongooseREST.insertRecordArray = function(records, callback){
    // for inserting bulk data.
    // var docs = [];
    // for(var index in records){
    //     var record = records[index];
    //     var doc = new TaxiRecord({  //change it
    //         t: new Date(record.t),
    //         l: record.l,
    //         n: record.n,
    //         d: record.d,
    //         i: record.i,
    //         v: record.v
    //     });
    //     docs.push(doc);
    // }
    // TaxiRecord.collection.insert(docs, function(err, results){
    //     console.log(err);
    //     console.log(results);

    //     if(err) { callback(err.toString()+"\n\n"); return; }
    //     callback(null, results);
    // });
  
    //for inserting a small array.
    TaxiRecord.create(records, function (err, docs){
        if(err) { callback(err.toString() + "\n"); return; }
        async.each(docs, function (doc, cb){
            doc.save(function (err){
                if(err) { cb(err); return; }
                cb();
            });
        }, function (err){
            if(err) { callback(err); return; }
            callback(docs.length + " records are inserted.\n");
        });  
    });
};

MongooseREST.queryData = function(query, callback){
    TaxiRecord.find(query, function (err, results){
        if(err) { callback(err); return; }
        callback(null, results);
    });
};

MongooseREST.updateData = function(conditions, operation, options, callback){
    TaxiRecord.update(conditions, operation, options, function (err, results){
        if(err) { callback(err); return; }
        console.log(results.n + "\n");
        callback(null, results);
    });
};


MongooseREST.insertFile = function(){};
MongooseREST.insertFileArray = function(){};

MongooseREST.deleteData = function(conditions, callback){
    TaxiRecord.remove(conditions, function (err, results){
        if(err) { callback(err); return; }
        console.log(results + "\n");
        callback(null, results);
    });
};


module.exports = MongooseREST;