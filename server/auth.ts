import { NextFunction, Response } from 'express';
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_REDIRECT_URI,
} from './config';
import { logger } from './container';
import Request from './Request';

export async function checkToken(access_token: string): Promise<number> {
	const auth = Buffer.from(
		`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`
	).toString('base64');

	const res = await fetch(
		`https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
		{
			method: 'POST',
			headers: {
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				Authorization: `Basic ${auth}`,
			},
			body: JSON.stringify({
				access_token,
			}),
		}
	);

	if (res.status === 200) {
		const json = await res.json();
		return Promise.resolve(json.user.id);
	} else {
		return Promise.reject();
	}
}

export async function authCallback(request: Request, response: Response) {
	logger.trace('Callback from github auth');
	const code = request.query.code;

	const githubResponse = await fetch(
		'https://github.com/login/oauth/access_token',
		{
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client_id: GITHUB_CLIENT_ID,
				client_secret: GITHUB_CLIENT_SECRET,
				redirect_uri: GITHUB_REDIRECT_URI,
				code,
			}),
		}
	);

	const json = await githubResponse.json();
	const token = json.access_token;

	try {
		await checkToken(token);
		response
			.cookie('GITHUB_TOKEN', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
			})
			.redirect('/');
	} catch (err) {
		logger.error(err);
		response.redirect('/');
	}
}

export async function checkUser(
	request: Request,
	response: Response,
	next: NextFunction
) {
	try {
		const token = request.cookies.GITHUB_TOKEN;
		const userId = await checkToken(token);
		logger.trace(`Authenticated user '${userId}'`);

		request.locals = {
			isAuthorized: true,
			userId,
		};

		next();
	} catch (err) {
		logger.error(err);
		response.sendStatus(403);
	}
}
