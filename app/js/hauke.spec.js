var request = require('request');
var sinon = require('sinon');
var expect = require('chai').expect;

var hauke = require('./hauke');


var mockResponse, cookieName, cookieValue, cookieOptions, cookieNameResetted, sendJson, mockResponseFromSteuermann;

function _createMockRequest(text) {
	return {
		body: {text: text},
		cookies: {}
	};
}

function _mockCreateCookie(name, value, options){
	cookieName = name;
	cookieValue = value;
	cookieOptions = options;
}

function _mockClearCookie(name){
	_resetCookie();
	cookieNameResetted = name;
}

function _mockSendJson(json) {
	sendJson = json;
}

function _resetCookie() {
	cookieName = null;
	cookieOptions = null;
	cookieValue = null;
	cookieNameResetted = null;
}

describe('Hauke', function () {

	before(function(){
		mockResponseFromSteuermann = {answer: "This is all, I have to say about it.", conversation_id: "123-abc-x"};

		_resetCookie();
		sendJson = null;

		mockResponse = {};
		mockResponse.cookie = _mockCreateCookie;
		mockResponse.clearCookie = _mockClearCookie;
		mockResponse.json = _mockSendJson;

		sinon
			.stub(request, 'post')
			.yields(null, null, mockResponseFromSteuermann);
	});

	after(function(){
		request.post.restore();
	});

	it('posts message to steuermann', function() {
		var req = _createMockRequest("Hallo Steuermann");

		hauke.postMessage(req, mockResponse);

		var argumentsOfFirstCall = request.post.args[0]; // fixme: need a way to assert arguments w/o fixed oder
		expect(argumentsOfFirstCall[0].uri).to.equal('http://steuermann.herokuapp.com/v1/message');
	});

	it('should construct the message with conversation_id', function () {
		var req = _createMockRequest("Hallo Steuermann");

		hauke.postMessage(req, mockResponse);

		var argumentsOfSecondCall = request.post.args[1]; // fixme: need a way to assert arguments w/o fixed oder
		//noinspection BadExpressionStatementJS
		expect(argumentsOfSecondCall[0].json.conversation_id).to.exist;
	});

	it('returns steuermann answer as text', function() {
		var req = _createMockRequest("Hallo Steuermann");

		hauke.postMessage(req, mockResponse);

		//noinspection JSUnresolvedVariable
		expect(sendJson).to.have.property('text', mockResponseFromSteuermann.answer);
	});

	it('should create a cookie with new conversation id', function() {
		var req = _createMockRequest("Hallo Steuermann");

		hauke.postMessage(req, mockResponse);

		expect(cookieName).to.equal('haukeConversation');
		expect(cookieValue).to.equal(mockResponseFromSteuermann.conversation_id);
	});

	it('should read conversation id from cookie when available', function() {
		var req = _createMockRequest("Hallo Steuermann");
		req.cookies = {haukeConversation:"xyz-012"};

		hauke.postMessage(req, mockResponse);

		var argumentsOfFifthCall = request.post.args[4]; // fixme: need a way to assert arguments w/o fixed oder;
		expect(argumentsOfFifthCall[0].json.conversation_id).to.equal("xyz-012");
	});


	it('should remove cookie when asked to do so with "Vergiss alles"', function() {
		var req = _createMockRequest("Vergiss alles");
		req.cookies = {haukeConversation:"xyz-012"};

		hauke.postMessage(req, mockResponse);

		expect(cookieNameResetted).to.equal("haukeConversation")
	});

});
