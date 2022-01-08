import ShortenedUrl from '../../src/models/ShortenedUrl';

export interface ShortenerStore {
	get: () => Promise<ShortenedUrl[]>;
	lookup: (key: string) => Promise<URL | undefined>;
	addRedirect: (key: string, url: URL) => Promise<void>;
}
