import request from 'supertest';
import { URL } from 'url';
import createApp from '../server/api';

describe('GET /s/', () => {
	test('unable to find key', (done) => {
		const { app } = createApp();
		request(app).get('/s/xyz').expect(404, done);
	});

	test('Getting key successfully', (done) => {
		const { app, store } = createApp();
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

describe('POST /s/', () => {
	test('insert new url', async () => {
		const { app, store } = createApp();
		const key = 'xyz';
		const url = new URL('https://example.com');

		const res = await request(app)
			.post(`/s/${key}`)
			.set('Content-Type', 'text/plain')
			.send(url.toString());

		expect(res.statusCode).toBe(200);
		expect(await store.lookup(key)).toEqual(url);
	});
});
