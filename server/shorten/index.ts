import ShortenedUrl from '../../src/models/ShortenedUrl';

export interface ShortenedUrlOptions {
	userId?: number;
	expiresOn?: Date;
}

export interface ShortenerStore {
	get: () => Promise<ShortenedUrl[]>;
	lookup: (key: string) => Promise<ShortenedUrl | null>;
	addRedirect: (
		key: string,
		url: URL,
		options?: ShortenedUrlOptions
	) => Promise<ShortenedUrl>;
}
