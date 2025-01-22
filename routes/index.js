// ce fichier est inutile... 
// à supprimer ? ou mettre les routes users ici ? 



var express = require('express');
var router = express.Router();

// GET home page.
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Hello World !' });
});

module.exports = router;
