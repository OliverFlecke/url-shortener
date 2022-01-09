import { ShortenerStore } from '.';
import ShortenedUrl from '../../src/models/ShortenedUrl';
import { logger } from '../container';

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

	lookup(key: string): Promise<ShortenedUrl | undefined> {
		logger.log(`Looking up ${key}`);

		if (key in this.data) {
			const url = this.data[key];
			logger.trace(`Found mapping: '${key}' -> '${url}'`);

			return Promise.resolve(url);
		} else {
			logger.warn(`Unable to find shorthand for ${key}`);
			return Promise.resolve(undefined);
		}
	}

	addRedirect(key: string, url: URL): Promise<void> {
		logger.log(`Adding mapping: '${key}' -> '${url}'`);
		this.data[key] = { name: key, url, createdOn: new Date(Date.now()) };

		return Promise.resolve();
	}
}
