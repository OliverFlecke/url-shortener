import { ShortenerStore } from '.';
import ShortenedUrl from '../../src/models/ShortenedUrl';
import { logger } from '../container';

export default class InMemoryShortenerStore implements ShortenerStore {
	data: { [key: string]: URL } = {};

	get(): Promise<ShortenedUrl[]> {
		const urls = Object.keys(this.data).map((key) => ({
			name: key,
			url: this.data[key],
		}));

		return Promise.resolve(urls);
	}

	lookup(key: string): Promise<URL | undefined> {
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
		this.data[key] = url;

		return Promise.resolve();
	}
}
