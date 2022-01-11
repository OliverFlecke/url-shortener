import { ShortenedUrlOptions, ShortenerStore } from '..';
import ShortenedUrl from '../../../src/models/ShortenedUrl';
import { logger } from '../../container';
import DbStore from './DbStore';

export interface InMemoryConfig extends DbStore {
	type: 'In memory';
}

export default class InMemoryShortenerStore implements ShortenerStore {
	data: { [key: string]: ShortenedUrl } = {};

	get(): Promise<ShortenedUrl[]> {
		const urls = Object.values(this.data)
			.sort(
				(a: ShortenedUrl, b: ShortenedUrl) =>
					a.createdOn.getTime() - b.createdOn.getTime()
			)
			.slice(0, 50);

		return Promise.resolve(urls);
	}

	lookup(key: string): Promise<ShortenedUrl | null> {
		logger.log(`Looking up ${key}`);

		if (key in this.data) {
			const url = this.data[key];
			logger.trace(`Found mapping: '${key}' -> '${url}'`);

			return Promise.resolve(url);
		} else {
			logger.warn(`Unable to find shorthand for ${key}`);
			return Promise.resolve(null);
		}
	}

	addRedirect(
		key: string,
		url: URL,
		options?: ShortenedUrlOptions
	): Promise<ShortenedUrl> {
		logger.log(`Adding mapping: '${key}' -> '${url}'`);
		const entry = {
			...options,
			name: key,
			url: url.toString(),
			createdOn: new Date(Date.now()),
		};
		this.data[key] = entry;

		return Promise.resolve(entry);
	}
}
