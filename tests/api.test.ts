import request from 'supertest';
import { URL } from 'url';
import createApp from '../server/api';
import ShortenedUrl from '../src/models/ShortenedUrl';
import { randomString } from './rand';

describe('GET /s/:slug', () => {
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

		const res = await request(app)
			.post(`/s/${key}`)
			.set('Content-Type', 'text/plain')
			.send(url);

		expect(res.statusCode).toEqual(400);
		expect(res.text).toEqual('Invalid URL');
		expect(await store.lookup(key)).toEqual(undefined);
	});
});

describe('GET /s/', () => {
	test('get all urls when empty', async () => {
		const { app } = createApp();

		const res = await request(app).get('/s/');

		expect(res.statusCode).toEqual(204);
	});

	test('get all urls with a few links', async () => {
		const { app, store } = createApp();
		const urls: ShortenedUrl[] = new Array(5).fill(undefined).map((_) => ({
			name: randomString(),
			url: new URL(`https://${randomString(8)}.${randomString(3)}`),
		}));
		urls.forEach((x) => store.addRedirect(x.name, x.url));

		const res = await request(app).get('/s/');

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual(
			urls.map((x) => ({ ...x, url: x.url.toString() }))
		);
	});
});
