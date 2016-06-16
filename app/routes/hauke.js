var express = require('express');
var router = express.Router();

var request = require('request');


router.post('/message', function(req, res) {
	request.post({
		uri: 'http://steuermann.herokuapp.com/v1/message',
		json: req.body
	}, function(error, response, body) {
		if(error) {
			res.json({text:"Das hat leider nicht geklappt. Ich habe anscheinend die Verbindung verloren."})
		} else {
			res.json(body);
		}
	});
});

router.get('/context', function(req, res) {


//	res.json(req.body);
});

module.exports = router;
