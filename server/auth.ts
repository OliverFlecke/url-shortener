import { NextFunction, Response } from 'express';
import { logger } from './container';
import Request from './Request';

async function checkToken(access_token: string): Promise<number> {
	const client_id = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
	const client_secret = process.env.GITHUB_CLIENT_SECRET;
	const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

	const response = await fetch(
		`https://api.github.com/applications/${client_id}/token`,
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

	if (response.status === 200) {
		const json = await response.json();
		return Promise.resolve(json.user.id);
	} else {
		logger.warn('Provided token is not valid');
		logger.warn(await response.text());
		return Promise.reject();
	}
}

export async function authCallback(request: Request, response: Response) {
	logger.log('Callback from github auth');
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
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				redirect_uri: process.env.GITHUB_REDIRECT_URI,
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
	_: Response,
	next: NextFunction
) {
	request.locals = request.locals ?? {};
	const token = request.cookies.GITHUB_TOKEN;

	try {
		if (request.cookies.GITHUB_TOKEN !== undefined) {
			const userId = await checkToken(token);
			logger.trace(`Authenticated user '${userId}'`);

			request.locals.isAuthorized = true;
			request.locals.userId = userId;
		}
		next();
	} catch (err) {
		next();
	}
}
