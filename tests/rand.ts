export function randomString(length: number = 8): string {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	return new Array(length)
		.fill(undefined)
		.map((_) => chars.charAt(Math.floor(Math.random() * chars.length)))
		.join('');
}

export function randomUserId(): number {
	return Math.floor(Math.random() * 1000000);
}

export function randomURL(): URL {
	return new URL(`https://${randomString()}.com`);
}

export function randomDate(): Date {
	return new Date(Math.random() * 1000000);
}
