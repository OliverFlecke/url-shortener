import { Collection, MongoClient } from 'mongodb';
import { ShortenerStore } from '.';
import ShortenedUrl from '../../src/models/ShortenedUrl';
import { logger } from '../container';

const port = 27017;
const defaultUrl = `mongodb://localhost:${port}`;

export default class MongoUrlStore implements ShortenerStore {
	private client: MongoClient;

	private get urls(): Collection<ShortenedUrl> {
		return this.client.db('main').collection<ShortenedUrl>('urls');
	}

	constructor(client: MongoClient) {
		this.client = client;

		logger.debug(`Connected to ${this.client.db}`);
	}

	static async create(url?: string) {
		const client = await MongoClient.connect(url ?? defaultUrl);
		logger.log('Connected to database');

		return new MongoUrlStore(client);
	}

	async get(): Promise<ShortenedUrl[]> {
		const urls = await this.urls.find({}).limit(50).toArray();

		return Promise.resolve(urls);
	}

	async lookup(key: string): Promise<ShortenedUrl | null> {
		const url = await this.urls.findOne({ name: key });
		return Promise.resolve(url);
	}

	async addRedirect(key: string, url: URL): Promise<void> {
		const entry: ShortenedUrl = {
			name: key,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		};
		await this.urls.insertOne(entry);

		return Promise.resolve();
	}
}
