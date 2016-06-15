var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.render('speech2text', { title: 'Speech2text' });
});

module.exports = router;
