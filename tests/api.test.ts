import createApp from '../server/api';
import request from 'supertest';
import { ConsoleLogger, LogLevel } from '../server/logger';

describe('GET /s/', () => {
	const app = createApp({
		logger: new ConsoleLogger(LogLevel.None),
	});

	test('unable to find key', (done) => {
		request(app).get('/s/xyz').expect(404, done);
	});

	test('Getting key successfully', (done) => {
		request(app)
			.get('/s/abc')
			.expect(302)
			.expect('Found. Redirecting to https://google.com')
			.end(done);
	});
});
