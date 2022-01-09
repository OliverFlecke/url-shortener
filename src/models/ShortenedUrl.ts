export default interface ShortenedUrl {
	name: string;
	url: URL;
	createdOn: Date;
	expiresOn?: Date;
	userId?: number;
}
