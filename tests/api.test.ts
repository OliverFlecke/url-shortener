import createApp from '../server/api';
import request from 'supertest';
import { ConsoleLogger, LogLevel } from '../server/logger';
import { URL } from 'url';

describe('GET /s/', () => {
	const { app, store } = createApp({
		logger: new ConsoleLogger(LogLevel.None),
	});

	test('unable to find key', (done) => {
		request(app).get('/s/xyz').expect(404, done);
	});

	test('Getting key successfully', (done) => {
		const key = 'abc';
		const url = new URL('https://google.com');
		store.addRedirect(key, url);

		request(app)
			.get(`/s/${key}`)
			.expect(302)
			.expect(`Found. Redirecting to ${url.toString()}`)
			.end(done);
	});
});
