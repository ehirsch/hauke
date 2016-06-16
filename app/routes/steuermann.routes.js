var express = require('express');
var router = express.Router();

var hauke = require('../js/steuermann');

router.post('/', hauke.postMessage );

router.get('/context', function(req, res) {


//	res.json(req.body);
});

module.exports = router;
