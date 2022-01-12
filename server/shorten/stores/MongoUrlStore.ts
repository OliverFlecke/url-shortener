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
	private db: string;
	private logger?: ILogger;

	private get urls(): Collection<ShortenedUrl> {
		return this.client.db(this.db).collection<ShortenedUrl>(urlCollectionName);
	}

	constructor(client: MongoClient, db: string = 'main', logger?: ILogger) {
		this.client = client;
		this.db = db;
		this.logger = logger;

		this.client.db(this.db).createCollection(urlCollectionName, {
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
		this.urls.createIndex({ name: 1 }, { unique: true });
	}

	async close() {
		await this.client.close();
	}

	/**
	 * Create an instance of this store, connected to the provided URI and database.
	 *
	 * @throws If unable to connect to a MongoDB at the provided URI.
	 * @returns A `MongoUrlStore` connected to the provided URI.
	 */
	static async create(uri?: string, db?: string, logger?: ILogger) {
		const url = uri ?? defaultUrl;
		try {
			const client = await MongoClient.connect(url, {
				serverSelectionTimeoutMS:
					process.env.NODE_ENV === 'production' ? undefined : 100,
			});
			logger?.log('Connected to database');

			return new MongoUrlStore(client, db);
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
