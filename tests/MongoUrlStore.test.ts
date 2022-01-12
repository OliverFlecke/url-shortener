import { Db, MongoClient, ObjectId } from 'mongodb';
import MongoUrlStore from '../server/shorten/stores/MongoUrlStore';
import { randomString, randomURL, randomUserId } from './rand';

const config = global as any;

describe('Store add redirect', () => {
	let store: MongoUrlStore;
	let db: Db;
	let client: MongoClient;

	beforeAll(async () => {
		store = await MongoUrlStore.create(
			config.__MONGO_URI__,
			config.__MONGO_DB_NAME__
		);
		client = await MongoClient.connect(config.__MONGO_URI__);
		db = await client.db(config.__MONGO_DB_NAME__);
	});

	afterAll(async () => {
		await store.close();
		await client.close();
	});

	test('insert one URL into the collection', async () => {
		const name = randomString();
		const url = new URL('https://example.com');

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
		const url = new URL('https://example.com');

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
});
