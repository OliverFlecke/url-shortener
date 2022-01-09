import ShortenedUrl from '../../src/models/ShortenedUrl';

export interface ShortenerStore {
	get: () => Promise<ShortenedUrl[]>;
	lookup: (key: string) => Promise<ShortenedUrl | undefined>;
	addRedirect: (key: string, url: URL) => Promise<void>;
}
