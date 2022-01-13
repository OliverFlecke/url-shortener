import { Db, MongoClient } from 'mongodb';
import MongoUrlStore from '../../server/shorten/stores/MongoUrlStore';
import { randomString } from '../rand';

const config = global as any;

export async function withStore(
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
