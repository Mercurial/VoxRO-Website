var express = require('express');
var router = express.Router();

var moongose = require('mongoose');
var mysql      = require('mysql');

var objects = moongose.model('objects', new moongose.Schema());

var connection = mysql.createConnection({
  host     : 'voxro.net',
  user     : 'root',
  password : 'test123',
  database : 'hercules'
});

router.get('/news/latest', function(req, res, next) {
  
  moongose.connect('mongodb://voxro.net/0');
  var db = moongose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function (callback) {
    objects.find({ '_key': /^topic\:/, 'tid': { $exists: true }, 'cid': 1},function(err, result){
     
       
      var returnData  = [];
      
      
      result.forEach(function(topic, idx, arr) {
        
        objects.findOne({ '_key' : /^post\:/ , 'tid': topic._doc.tid },function( err, post){
          
          objects.findOne({ '_key': /^user\:/, 'uid': topic._doc.uid },function(err, user) {
            
            returnData.push({
              'title': topic._doc.title,
              'timestamp': topic._doc.timestamp,
              'content': post._doc.content,
              'url': topic._doc.slug,
              'poster_name': user._doc.username,
              'avatar_url': user._doc.picture
            });
            
          });
          
        });
      });
      
      var intId = setInterval(function() {
        if(returnData.length == result.length)
        {
          clearInterval(intId);
          res.send(returnData);
          moongose.disconnect();
        }
      },100);
      
    });
  });
});


router.get('/server/players_online', function(req, res, next) {
 
  
  connection.query('SELECT count(*) as count FROM hercules.`char` WHERE online=1;', function(err, rows, fields) {
    if (err) throw err;
    
    connection.query("UPDATE mapreg SET value=" + rows[0].count + " WHERE varname='peak_players' AND value  < " + rows[0].count,function () {
       connection.query('SELECT value FROM hercules.`mapreg` WHERE varname="peak_players";', function(err, rows2, fields) {
        if (err) throw err;
        res.send({
          'count': rows[0].count,
          'peak': rows2[0].value
        });
       });
    });
    
  });
  
});



var net = require('net');
router.get('/server/status', function(req, res, next) {
    
    // the machine to scan
    var host = 'voxro.net';
    // starting from port number
    var start = 5121;
    var s = new net.Socket();
          
    s.connect(start, host, function() {
      // we don't destroy the socket cos we want to listen to data event
      // the socket will self-destruct in 2 secs cos of the timeout we set, so no worries
      res.send({'online': true});
    });
    
    s.on('error', function(e) {
      // silently catch all errors - assume the port is closed
      s.destroy();
       res.send({'online': false});
    });
});

module.exports = router;
