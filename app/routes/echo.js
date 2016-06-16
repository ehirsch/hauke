var express = require('express');
var router = express.Router();

/* GET debug listing. */
router.post('/', function(req, res) {
	console.log('ECHO: ');
	console.log(req.body);
	res.json(req.body);
});

module.exports = router;
