export function randomString(length: number = 8): string {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	return new Array(length)
		.fill(undefined)
		.map((_) => chars.charAt(Math.floor(Math.random() * chars.length)))
		.join('');
}
