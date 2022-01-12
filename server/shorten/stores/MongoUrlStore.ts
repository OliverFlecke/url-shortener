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

export default class MongoUrlStore implements ShortenerStore {
	private client: MongoClient;
	private db: string;
	private logger?: ILogger;

	private get urls(): Collection<ShortenedUrl> {
		return this.client.db(this.db).collection<ShortenedUrl>('urls');
	}

	constructor(client: MongoClient, db: string = 'main', logger?: ILogger) {
		this.client = client;
		this.db = db;
		this.logger = logger;
	}

	async close() {
		await this.client.close();
	}

	static async create(uri?: string, db?: string, logger?: ILogger) {
		const url = uri ?? defaultUrl;
		try {
			const client = await MongoClient.connect(url);
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
		key: string,
		url: URL,
		options?: ShortenedUrlOptions
	): Promise<ShortenedUrl> {
		this.logger?.trace(`Adding redirect from '${key}' -> '${url.toString()}'`);
		const entry: ShortenedUrl = {
			...options,
			name: key,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		};
		await this.urls.insertOne(entry);

		return Promise.resolve(entry);
	}
}
