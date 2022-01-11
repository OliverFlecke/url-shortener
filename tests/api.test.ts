import express from 'express';
import request from 'supertest';
import { URL } from 'url';

import createApp from '../server/api';
import { mockAuth } from './mocks/auth';
import { randomString, randomUserId } from './rand';

describe('GET /s/:slug', () => {
	test('unable to find key', async () => {
		const { app } = await createApp();
		await request(app).get('/s/xyz').expect(404);
	});

	test('Getting key successfully', async () => {
		const { app, store } = await createApp();
		const key = 'abc';
		const url = new URL('https://google.com');
		store.addRedirect(key, url);

		await request(app)
			.get(`/s/${key}`)
			.expect(302)
			.expect(`Found. Redirecting to ${url.toString()}`);
	});
});

describe('POST /s/', () => {
	test('insert new url', async () => {
		const { app, store } = await createApp();
		const key = 'xyz';
		const url = new URL('https://example.com');

		await request(app)
			.post(`/s/${key}`)
			.set('Content-Type', 'text/plain')
			.send(url.toString())
			.expect(200);

		expect(await store.lookup(key)).toEqual({
			name: key,
			url: url.toString(),
			createdOn: expect.any(Date),
		});
	});

	test('without a body', async () => {
		const { app, store } = await createApp();
		const key = randomString();

		const res = await request(app).post(`/s/${key}`).send();

		expect(res.statusCode).toBe(400);
		expect(res.text).toEqual('Invalid URL');
		expect(await store.lookup(key)).toEqual(null);
	});

	test('with a body, but which is not a valid URI', async () => {
		const { app, store } = await createApp();
		const key = randomString();
		const url = randomString(32);

		const res = await request(app)
			.post(`/s/${key}`)
			.set('Content-Type', 'text/plain')
			.send(url);

		expect(res.statusCode).toEqual(400);
		expect(res.text).toEqual('Invalid URL');
		expect(await store.lookup(key)).toEqual(null);
	});

	test('without a provided name should generate random', async () => {
		const { app, store } = await createApp();
		const url = new URL('https://example.com');

		const res = await request(app)
			.post('/s/')
			.set('Content-Type', 'text/plain')
			.send(url.toString())
			.expect(200);

		expect(res.text).not.toBeNull();
		const name = JSON.parse(res.text).name;
		expect(await store.lookup(name)).toEqual({
			name: name,
			url: url.toString(),
			createdOn: expect.any(Date),
		});
	});
});

describe('GET /s/', () => {
	test('get all urls when empty', async () => {
		const { app } = await createApp();

		const res = await request(app).get('/s/');

		expect(res.statusCode).toEqual(204);
	});

	test('get all urls with a few links', async () => {
		const { app, store } = await createApp();
		const urls = new Array(5).fill(undefined).map((_) => ({
			name: randomString(),
			url: new URL(`https://${randomString(8)}.${randomString(3)}`),
		}));
		urls.forEach((x) => store.addRedirect(x.name, x.url));

		const res = await request(app).get('/s/');

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual(
			urls.map((x) => ({
				...x,
				url: x.url.toString(),
				createdOn: expect.any(String),
			}))
		);
	});
});

describe('POST /s/ with authentication', () => {
	test('create link as signed in user', async () => {
		const userId = Math.floor(Math.random() * 10000);
		const { app, store } = await createApp({
			app: express().use(mockAuth(userId)),
		});
		const name = 'xyz';
		const url = new URL('https://example.com');

		await request(app)
			.post(`/s/${name}`)
			.set('Content-Type', 'text/plain')
			.send(url.toString())
			.expect(200);

		expect(await store.lookup(name)).toEqual({
			createdOn: expect.any(Date),
			url: url.toString(),
			name,
			userId,
		});
	});

	test('create link as signed in user without a name', async () => {
		const userId = Math.floor(Math.random() * 10000);
		const { app, store } = await createApp({
			app: express().use(mockAuth(userId)),
		});
		const url = new URL('https://example.com');

		const res = await request(app)
			.post(`/s/`)
			.set('Content-Type', 'text/plain')
			.send(url.toString())
			.expect(200);

		const name = JSON.parse(res.text).name;

		expect(await store.lookup(name)).toEqual({
			createdOn: expect.any(Date),
			url: url.toString(),
			name,
			userId,
		});
	});
});

describe('GET /s/', () => {
	test('returns urls created by the logged in user', async () => {
		const userId = Math.floor(Math.random() * 10000);
		const name = randomString();
		const url = new URL('https://example.com');
		const { app, store } = await createApp({
			app: express().use(mockAuth(userId)),
		});

		// Add url for logged in user
		const entity = await store.addRedirect(name, url, { userId });

		const res = await request(app).get('/s?private').expect(200);

		expect(res.body).toEqual([
			{
				...entity,
				createdOn: expect.any(String),
			},
		]);
	});

	test('returns urls created by the logged in user, but not other users', async () => {
		const userId = randomUserId();
		const name = randomString();
		const url = new URL('https://example.com');
		const { app, store } = await createApp({
			app: express().use(mockAuth(userId)),
		});

		// Add url for other users
		for (let index = 0; index < 10; index++) {
			await store.addRedirect(randomString(), url, {
				userId: randomUserId(),
			});
		}

		// Add url for logged in user
		const entity = await store.addRedirect(name, url, { userId });

		const res = await request(app).get('/s?private').expect(200);

		expect(res.body).toEqual([
			{
				...entity,
				createdOn: expect.any(String),
			},
		]);
	});

	test('logged in user should be able to get all public urls', async () => {
		const userId = randomUserId();
		const name = randomString();
		const url = new URL('https://example.com');
		const { app, store } = await createApp({
			app: express().use(mockAuth(userId)),
		});

		// Add public urls
		const names = new Array(10).fill(undefined).map((_) => randomString());
		for (const name of names) {
			await store.addRedirect(name, url, {});
		}

		// Add url for logged in user
		const entry = await store.addRedirect(name, url, { userId });

		const res = await request(app).get('/s').expect(200);

		expect(res.body).toEqual(
			names.map((name) => ({
				name,
				url: url.toString(),
				createdOn: expect.any(String),
			}))
		);
		expect(res.body.find((x: any) => x.name == name)).toBeUndefined();
		expect(await store.lookup(name)).toEqual(entry);
	});
});
