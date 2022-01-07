export interface ShortenerStore {
	lookup: (key: string) => Promise<URL | undefined>;
	addRedirect: (key: string, url: URL) => Promise<void>;
}
