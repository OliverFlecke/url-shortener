import { ShortenerStore } from '.';
import { logger } from '../container';
import { UrlNotFoundError } from './errors';

export default class InMemoryShortenerStore implements ShortenerStore {
	data: { [key: string]: URL } = {};

	lookup(key: string): Promise<URL> {
		logger.debug(`Looking up ${key}`);

		if (key in this.data) {
			const url = this.data[key];
			logger.debug(`Found mapping: '${key}' -> '${url}'`);

			return Promise.resolve(url);
		} else {
			logger.warn(`Unable to find shorthand for ${key}`);
			return Promise.reject(new UrlNotFoundError());
		}
	}

	addRedirect(key: string, url: URL): Promise<void> {
		this.data[key] = url;

		return Promise.resolve();
	}
}
