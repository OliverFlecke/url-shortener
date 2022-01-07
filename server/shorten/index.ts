import { UrlNotFoundError } from './errors';

const data: { [key: string]: string } = {
	abc: 'https://google.com',
};

export function lookup(key: string): Promise<string> {
	console.debug(`Looking up ${key}`);

	if (key in data) {
		const url = data[key];
		console.debug(`Found mapping: '${key}' -> '${url}'`);

		return Promise.resolve(url);
	} else {
		console.warn(`Unable to find shorthand for ${key}`);
		return Promise.reject(new UrlNotFoundError());
	}
}

export function addRedirect(key: string, url: URL): Promise<void> {
  data[key] = url.toString();

  return Promise.resolve();
}