var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Vox Ragnarok Online' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Vox Ragnarok Online' });
});

module.exports = router;
