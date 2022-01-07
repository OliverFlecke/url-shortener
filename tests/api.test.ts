import request from 'supertest';
import { URL } from 'url';
import createApp from '../server/api';
import { randomString } from './rand';

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

	test('without a body', async () => {
		const { app, store } = createApp();
		const key = randomString();

		const res = await request(app).post(`/s/${key}`).send();

		expect(res.statusCode).toBe(400);
		expect(res.text).toEqual('Invalid URL');
		expect(await store.lookup(key)).toEqual(undefined);
	});

	test('with a body, but which is not a valid URI', async () => {
		const { app, store } = createApp();
		const key = randomString();
		const url = randomString(32);

		const res = await request(app).post(`/s/${key}`).set('Content-Type', 'text/plain').send(url);

		expect(res.statusCode).toEqual(400);
		expect(res.text).toEqual('Invalid URL');
		expect(await store.lookup(key)).toEqual(undefined);
	});
});
