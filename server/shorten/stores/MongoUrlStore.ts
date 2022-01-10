import { Collection, MongoClient } from 'mongodb';
import { ShortenerStore } from '..';
import ShortenedUrl from '../../../src/models/ShortenedUrl';
import { logger } from '../../container';
import DbStore from './DbStore';

export interface MongoDbConfig extends DbStore {
	type: 'MongoDb';
	host: string;
	port: number;
}

const port = 27017;
const defaultUrl = `mongodb://localhost:${port}`;

export default class MongoUrlStore implements ShortenerStore {
	private client: MongoClient;

	private get urls(): Collection<ShortenedUrl> {
		return this.client.db('main').collection<ShortenedUrl>('urls');
	}

	constructor(client: MongoClient) {
		this.client = client;
	}

	static async create(config?: MongoDbConfig) {
		const url = config ? `mongodb://${config.host}:${config.port}` : defaultUrl;
		try {
			logger.debug(`Connecting to ${url}`);
			const client = await MongoClient.connect(url);
			logger.log('Connected to database');

			return new MongoUrlStore(client);
		} catch (err) {
			logger.error(`Unable to connect to MongoDB: ${err}`);
			throw err;
		}
	}

	async get(): Promise<ShortenedUrl[]> {
		const urls = await this.urls.find({}).limit(50).toArray();

		return Promise.resolve(urls);
	}

	async lookup(key: string): Promise<ShortenedUrl | null> {
		const url = await this.urls.findOne({ name: key });
		return Promise.resolve(url);
	}

	async addRedirect(key: string, url: URL): Promise<ShortenedUrl> {
		const entry: ShortenedUrl = {
			name: key,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		};
		await this.urls.insertOne(entry);

		return Promise.resolve(entry);
	}
}
