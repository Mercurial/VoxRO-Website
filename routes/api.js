var express = require('express');
var router = express.Router();

var moongose = require('mongoose');

var objects = moongose.model('objects', new moongose.Schema());

router.get('/news/latest', function(req, res, next) {
  
  moongose.connect('mongodb://voxro.net/0');
  var db = moongose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function (callback) {
    objects.find({ '_key': /^topic\:/, 'tid': { $exists: true }},function(err, result){
     
       
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

module.exports = router;
