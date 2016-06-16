var request = require('supertest');
var http = require('http');

describe('Posting messages to /hauke', function () {
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


	it('responds to /hauke', function testMessage(done) {
		request(server)
			.post('/hauke')
			.send({text:"hi"})
			.expect(200, done);
	});

});