import { fail } from 'assert';
import { Db, MongoClient, ObjectId } from 'mongodb';
import MongoUrlStore from '../server/shorten/stores/MongoUrlStore';
import { randomDate, randomString, randomURL, randomUserId } from './rand';

const config = global as any;

async function withStore(
	testMethod: (store: MongoUrlStore, db: Db) => Promise<void>
) {
	const dbName = randomString(32);
	const store = await MongoUrlStore.create(config.__MONGO_URI__, dbName);
	const client = await MongoClient.connect(config.__MONGO_URI__);
	const db = await client.db(dbName);

	try {
		await testMethod(store, db);
	} finally {
		await store.close();
		await client.close();
	}
}

describe('Store add redirect', () => {
	let store: MongoUrlStore;
	let db: Db;
	let client: MongoClient;

	beforeAll(async () => {
		const dbName = randomString(32);
		store = await MongoUrlStore.create(config.__MONGO_URI__, dbName);
		client = await MongoClient.connect(config.__MONGO_URI__);
		db = await client.db(dbName);
	});

	afterAll(async () => {
		await store.close();
		await client.close();
	});

	test('insert one URL into the collection', async () => {
		const name = randomString();
		const url = randomURL();

		// Act
		await store.addRedirect(name, url);

		const insertedUser = await db.collection('urls').findOne({ name });
		expect(insertedUser).toEqual({
			_id: expect.any(ObjectId),
			createdOn: expect.any(Date),
			name,
			url: url.toString(),
		});
	});

	test('insert one URL into the collection for a user', async () => {
		const userId = randomUserId();
		const name = randomString();
		const url = randomURL();

		// Act
		await store.addRedirect(name, url, { userId });

		const insertedUser = await db.collection('urls').findOne({ name });
		expect(insertedUser).toEqual({
			_id: expect.any(ObjectId),
			createdOn: expect.any(Date),
			name,
			userId,
			url: url.toString(),
		});
	});

	test('lookup by name', async () => {
		const name = randomString();
		const url = randomURL();
		db.collection('urls').insertOne({
			name,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		});

		// Act
		const entry = await store.lookup(name);

		expect(entry).toEqual({
			_id: expect.any(ObjectId),
			name,
			url: url.toString(),
			createdOn: expect.any(Date),
		});
	});

	test('insert with same name should fail', async () => {
		const name = randomString();
		const url = randomURL();
		await store.addRedirect(name, url);

		// Act
		try {
			await store.addRedirect(name, url);
			fail();
		} catch (e) {
			expect(e).toBeDefined();
		}

		expect(await store.lookup(name)).toEqual({
			_id: expect.any(ObjectId),
			createdOn: expect.any(Date),
			name,
			url: url.toString(),
		});
		expect(await db.collection('urls').find({ name }).toArray()).toHaveLength(
			1
		);
	});
});

describe('Get urls', () => {
	test('get all URLs', async () => {
		await withStore(async (store, db) => {
			const urls = new Array(20).fill(undefined).map((_) => ({
				name: randomString(),
				url: randomURL().toString(),
				createdOn: randomDate(),
			}));

			await db.collection('urls').insertMany(urls);

			// Act
			const entries = await store.get();

			expect(entries).toHaveLength(urls.length);
			expect(entries).toEqual(
				urls.map((x) => ({
					_id: expect.any(ObjectId),
					...x,
				}))
			);
		});
	});

	test('get urls only for user', async () => {
		await withStore(async (store, db) => {
			const userId = randomUserId();
			const userUrls = new Array(20).fill(undefined).map((_) => ({
				name: randomString(),
				url: randomURL().toString(),
				createdOn: randomDate(),
				userId,
			}));
			const urls = new Array(20).fill(undefined).map((_) => ({
				name: randomString(),
				url: randomURL().toString(),
				createdOn: randomDate(),
			}));
			await db.collection('urls').insertMany(userUrls);
			await db.collection('urls').insertMany(urls);

			// Act
			const entries = await store.get(userId);

			expect(entries).toHaveLength(userUrls.length);
			expect(entries).toEqual(
				userUrls.map((x) => ({
					_id: expect.any(ObjectId),
					...x,
				}))
			);
		});
	});
});

describe('MongoUrlStore setup', () => {
	test('invalid url to db should throw', async () => {
		try {
			await MongoUrlStore.create(randomString());
			fail();
		} catch (e) {
			expect(e).toBeDefined();
		}
	});

	test('create without url should fail (no connection available during test)', async () => {
		try {
			await MongoUrlStore.create();
			fail();
		} catch (e) {
			expect(e).toBeDefined();
		}
	});
});

describe('Delete urls', () => {
	test('user deletes an URL they own', async () =>
		await withStore(async (store, db) => {
			const name = randomString();
			const userId = randomUserId();
			await store.addRedirect(name, randomURL(), { userId });

			await store.remove(name, userId);

			expect(await db.collection('urls').findOne({ name })).toBeNull();
		}));

	test('user cannot delete url owned by another user', async () =>
		await withStore(async (store, db) => {
			const name = randomString();
			const userId = randomUserId();
			const otherUserId = randomUserId();

			await store.addRedirect(name, randomURL(), { userId });
			expect(await store.remove(name, otherUserId)).toBeFalsy();

			expect(await db.collection('urls').findOne({ name })).not.toBeNull();
			expect(await db.collection('urls').findOne({ name })).toEqual({
				name,
				userId,
				url: expect.any(String),
				_id: expect.any(ObjectId),
				createdOn: expect.any(Date),
			});
		}));
});
