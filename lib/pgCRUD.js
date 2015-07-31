var pg = require('pg');

var Postgresql = new Object();
var pgUrl = '';

Postgresql.init = function(url){
    pgUrl = url;
    return this;
}

Postgresql.queryByLocationAndTime = function(loc, time, callback){
    pg.connect(pgUrl, function(err, client, done) {
        if(err) {
            return callback('Failed to connect : '+ err);
        }
        var query = " SELECT ST_X(location::geometry) as x, " + 
            " ST_Y(location::geometry) as y, " + 
            " plate_number, time, direction from taxis22 " + 
            " where ST_Y(location::geometry) < " + loc.latitudeUpperBound +
            " and  ST_Y(location::geometry) > " + loc.latitudeLowerBound +
            " and  ST_X(location::geometry) < " + loc.longtitudeUpperBound +
            " and  ST_X(location::geometry) > " + loc.longtitudeLowerBound +
            " and time < '" + time.upperBound + "' " + 
            " and time > '" + time.lowerBound + "' " + 
            " order by plate_number, time;";
        console.log(query);
        client.query(query , function(err, result) {
            done();
            if(err) {
                return callback('Error running query : ' + err);
            }
            return callback(null, result.rows)
        });
    });
}


module.exports = Postgresql;