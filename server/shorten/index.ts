import ShortenedUrl from '../../src/models/ShortenedUrl';

export interface ShortenedUrlOptions {
	userId?: number;
	expiresOn?: Date;
}

export interface ShortenerStore {
	get: (userId?: number) => Promise<ShortenedUrl[]>;
	lookup: (name: string) => Promise<ShortenedUrl | null>;
	addRedirect: (
		name: string,
		url: URL,
		options?: ShortenedUrlOptions
	) => Promise<ShortenedUrl>;
	remove: (name: string, userId: number) => Promise<boolean>;
}
