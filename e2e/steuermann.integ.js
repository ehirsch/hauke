var request = require('supertest');
var http = require('http');

describe('Posting messages to /steuermann', function () {
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


	it('responds to /steuermann', function testMessage(done) {
		request(server)
			.post('/steuermann')
			.send({text:"hi"})
			.expect(200, done);
	});

});