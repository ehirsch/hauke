var request = require('supertest');
var http = require('http');

describe('Smoke testing Hauke', function () {
	var app, server;

	beforeEach(function () {
		delete require.cache[require.resolve('../app')];
		app = require('../app');
		server = http.createServer(app);
		server.listen();
	});

	afterEach(function (done) {
		server.close(done);
	});


	it('responds to /hauke/message', function testMessage(done) {
		request(server)
			.post('/hauke/message')
			.send({text:"hi", userId:"123-abc"})
			.expect(200, done);
	});

});