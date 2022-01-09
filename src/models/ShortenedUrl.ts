export default interface ShortenedUrl {
	name: string;
	url: string;
	createdOn: Date;
	expiresOn?: Date;
	userId?: number;
}
