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
    if (err)
    {
      res.send(500,'error');
       return;
    }
    connection.query("UPDATE mapreg SET value=" + rows[0].count + " WHERE varname='peak_players' AND value  < " + rows[0].count,function () {
       connection.query('SELECT value FROM hercules.`mapreg` WHERE varname="peak_players";', function(err, rows2, fields) {
        if (err)
        {
          res.send(500,'error');
          return;
        }
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


var recaptcha  = require('nodejs-nocaptcha-recaptcha');

router.post('/verify_captcha', function(req, res, next) {
  var captcha_resp = req.body.captcha;
   recaptcha(captcha_resp,"6LdrPxITAAAAAP3BI8s6liBCdWvGMc5Rz-zs1ZKp", function (success){
       console.log(success);
       if(!success)
       {
         res.send({'success': false});
       }
       else
       {
         res.send({'success': true});
       }
    });
});

router.post('/accounts/check_ue', function(req, res, next) {
  
  var email = mysql.escape(req.body.email);
  var username = mysql.escape(req.body.username);
  var query = 'SELECT count(*) as count FROM hercules.`login` WHERE userid='+ username +' OR email='+ email +';';
  console.log(query);
  connection.query(query, function(err, rows, fields) {
    
    if (err)
    {
      res.send(500,'error');
        return;
    }
    
    res.send(rows[0]);
    
  });
  
 
});

router.post('/accounts/create', function(req, res, next) {
  
  var email = mysql.escape(req.body.email);
  var username = mysql.escape(req.body.username);
  var password = mysql.escape(req.body.password);
  var birthday = new Date(req.body.birthday);
  birthday = birthday.getFullYear() + '-' + (birthday.getMonth()+1) + '-' + birthday.getDate();
  
  var sex = parseInt(req.body.gender) == 0 ? 'M':'F';
  var lastip = req.ip;
  
  var captcha_resp = req.body.captchaValue;
  recaptcha(captcha_resp,"6LdrPxITAAAAAP3BI8s6liBCdWvGMc5Rz-zs1ZKp", function (success){
      
      if(!success)
      {
        res.send({'success': false, 'message': 'You must prove you are human!'});
      }
      else
      {
        var query = "INSERT INTO login (userid,user_pass,sex,email,last_ip,birthdate,state) VALUES (" + username + ","+ password +",'" + sex +"',"+ email +",'"+ lastip +"','"+ birthday +"',0)";
        console.log(query);
        connection.query(query, function(err, rows, fields) {
          
          if (err)
          {
            res.send(500,err);
              return;
          }
          
          res.send({
            'success': true
          });
          
        });
      }
  });
  
});
    

module.exports = router;
