var request = require('request');

// const
var cookieName = 'haukeConversation';
var ControlFunction = {
	"Vergiss alles": function(req,res) {

		res.clearCookie(cookieName);
		res.json({
			text: "OK! Mein Kopf ist leer!",
			command: 'clear'
		});
	}
};


function createGUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

function getConversationId(request) {
	var cookieValue = request.cookies.haukeConversation;
	if( cookieValue ) {
		return cookieValue;
	} else {
		return createGUID();
	}
}

function buildMessage(request) {
	var message = request.body;
	message.conversation_id = getConversationId(request);
	return message;
}

function storeConversationId(id, res) {
	res.cookie(cookieName,id, { httpOnly: true }); // maxAge: 900000 -> needed?
}

function postToSteuermann(req, res) {
	var message = buildMessage(req);

	request.post({
		uri: 'http://steuermann.herokuapp.com/v1/message',
		json: message
	}, function (error, response, body) {
		var answer = {};
		if (error) {
			res.json({text: "Das hat leider nicht geklappt. Ich habe anscheinend die Verbindung verloren."})
		} else {
			answer.text = body.answer;

			// store conversation_id
			storeConversationId(body.conversation_id, res);
			res.json(answer);
		}
	});
}



function getControlFunction(request) {
	var command = request.body.text;
	return ControlFunction[command];
}


function postMessage(req, res) {
	var controlFunction = getControlFunction(req);
	if(controlFunction) {
		controlFunction(req, res);
	} else {
		postToSteuermann(req, res);
	}
}

module.exports = {
	postMessage : postMessage
};