export interface ShortenerStore {
	lookup: (key: string) => Promise<URL>;
	addRedirect: (key: string, url: URL) => Promise<void>;
}
