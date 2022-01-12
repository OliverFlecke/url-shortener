import { Collection, MongoClient } from 'mongodb';
import { ShortenedUrlOptions, ShortenerStore } from '..';
import ShortenedUrl from '../../../src/models/ShortenedUrl';
import { ILogger } from '../../logger';
import DbStore from './DbStore';

export interface MongoDbConfig extends DbStore {
	type: 'MongoDb';
	host: string;
	port: number;
	db?: string;
}

const port = 27017;
const defaultUrl = `mongodb://localhost:${port}`;

const urlCollectionName = 'urls';

export default class MongoUrlStore implements ShortenerStore {
	private client: MongoClient;
	private dbName: string;
	private logger?: ILogger;

	private get urls(): Collection<ShortenedUrl> {
		return this.client
			.db(this.dbName)
			.collection<ShortenedUrl>(urlCollectionName);
	}

	constructor(client: MongoClient, db: string, logger?: ILogger) {
		this.client = client;
		this.dbName = db;
		this.logger = logger;
	}

	async close() {
		await this.client.close();
	}

	private static async setupCollection(
		client: MongoClient,
		dbName: string
	): Promise<void> {
		await client.db(dbName).createCollection(urlCollectionName, {
			validator: {
				$jsonSchema: {
					bsonType: 'object',
					required: ['name', 'url', 'createdOn'],
					properties: {
						name: {
							bsonType: 'string',
							description: 'must be a string and is required',
						},
						url: {
							bsonType: 'string',
							description: 'must be a valid URL',
						},
						userId: {
							bsonType: 'int',
							description: 'optional user id of the user which own this url',
						},
						createdOn: {
							bsonType: 'date',
							description: 'date which this URL is created on',
						},
						expiresOn: {
							bsonType: 'date',
							description: 'optional date when the URL expires',
						},
					},
				},
			},
		});
		await client
			.db(dbName)
			.collection(urlCollectionName)
			.createIndex({ name: 1 }, { unique: true });
	}

	/**
	 * Create an instance of this store, connected to the provided URI and database.
	 *
	 * @throws If unable to connect to a MongoDB at the provided URI.
	 * @returns A `MongoUrlStore` connected to the provided URI.
	 */
	static async create(uri?: string, dbName?: string, logger?: ILogger) {
		const url = uri ?? defaultUrl;
		dbName = dbName ?? 'main';

		try {
			const client = await MongoClient.connect(url, {
				serverSelectionTimeoutMS:
					process.env.NODE_ENV === 'production' ? undefined : 100,
			});
			logger?.log('Connected to database');

			const collections = await client
				.db(dbName)
				.listCollections({ name: 'urls' })
				.toArray();
			if (collections.length === 0) {
				this.setupCollection(client, dbName);
			}

			return new MongoUrlStore(client, dbName);
		} catch (err) {
			logger?.error(`Unable to connect to MongoDB: ${err}`);
			throw err;
		}
	}

	async get(userId?: number): Promise<ShortenedUrl[]> {
		const urls = await this.urls.find({ userId }).limit(50).toArray();

		return Promise.resolve(urls);
	}

	async lookup(key: string): Promise<ShortenedUrl | null> {
		return await this.urls.findOne({ name: key });
	}

	async addRedirect(
		name: string,
		url: URL,
		options?: ShortenedUrlOptions
	): Promise<ShortenedUrl> {
		this.logger?.trace(`Adding redirect from '${name}' -> '${url.toString()}'`);
		const entry: ShortenedUrl = {
			...options,
			name,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		};
		await this.urls.insertOne(entry);

		return Promise.resolve(entry);
	}

	async remove(name: string, userId: number): Promise<boolean> {
		this.logger?.trace(`Removing '${name}' by user '${userId}'`);

		const result = await this.urls.deleteOne({ name, userId });
		return result.acknowledged && result.deletedCount !== 0;
	}
}
