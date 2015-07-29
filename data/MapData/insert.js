//insert Geo-Json-Data into mongodb
//created by Tiny, 2015/7/28

var fs = require('fs');
var path = require('path');
var async = require('async');
var client = require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017/mapdata';

var insertRecordChina = function(doc, callback) {
    client.connect(url, function (err, db){
        if(err){
            callback(err);
            return;
        }
        var col = db.collection("china");
        col.insert(doc, function (err){
            if(err) { callback(err); db.close(); return; }
            callback(null, " Insert Success.");
            db.close();
        });
    });
};

var insertRecordProvince = function(doc, callback) {
    client.connect(url, function (err, db){
        if(err){
            callback(err);
            return;
        }
        var col = db.collection("province");
        col.insert(doc, function (err){
            if(err) { callback(err); db.close(); return; }
            callback(null, " Insert Success.");
            db.close();
        });
    });
};

var insertRecordCounty = function(doc, callback) {
    client.connect(url, function (err, db){
        if(err){
            callback(err);
            return;
        }
        var col = db.collection("county");
        col.insert(doc, function (err){
            if(err) { callback(err); db.close(); return; }
            callback(null, " Insert Success.");
            db.close();
        });
    });
};

// { "type" : "Feature", "properties" : { "name" : "宁河县", "id" : "120121" }}

console.log("============= Start !==============");
console.time("Uptime");

var countryPath = path.join(__dirname, "GeoData/china.json");
fs.readFile(countryPath, 'utf8', function (err, buffer){
    if(err) { console.log(err); return; }
    var data = JSON.parse(buffer);
    insertRecordChina(data, function (err, output){
        if(err) { console.log(err); return; }
        console.log("china.json" + output);
    });
});

var provincePath = path.join(__dirname, 'GeoData/geometryProvince');
fs.readdir(provincePath, function(err, list){
    if(err) { console.log(err); return; }
    // console.log(list);
    list.forEach(function(file){
        var filePath = path.join(provincePath, file);
        var id = file.split('.').shift();
        fs.readFile(filePath, 'utf8', function(err, buffer){
            if(err) { throw err; return; }
            var data = JSON.parse(buffer);
            data.id = id;
            // console.log(data);
            insertRecordProvince(data, function(err, output){
                if(err) { console.log(err); return; }
                console.log(file + output);
            });
        });
    });
});

var counter = 0;
var countiesPath = path.join(__dirname, 'GeoData/geometryCounties');
fs.readdir(countiesPath, function(err, list){
    if(err) { console.log(err); return; }
    async.eachSeries(list, 
        function(file, callback){
            var filePath = path.join(countiesPath, file);
            var id = file.split('.').shift();
            fs.readFile(filePath, 'utf8', function(err, buffer){
                var reg = /\{"type":"Feature","properties":\{"name":".+?\}\}/g;
                var docArray = buffer.match(reg);
                async.each(docArray, function(element, cb){
                    var doc = JSON.parse(element);
                    doc.id = id;
                    insertRecordCounty(doc, function(err,output){
                        if(err) { cb(err); return; }
                        counter += 1;
                        console.log("No." + counter + output);
                        cb();
                    });
                }, function(err){
                    if(err){ callback(err); return; }
                    callback();
                });  
            });
    },  function(err){
            if(err) { console.log(err); return; }
            console.timeEnd("Uptime");
            console.log("============= Finished !==============");
    });
});
