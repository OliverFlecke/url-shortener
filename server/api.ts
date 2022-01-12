import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { Express, Response } from 'express';
import { randomString } from '../tests/rand';
import { authCallback, checkUser } from './auth';
import configureContainer, {
	Container,
	ContainerConfig,
	logger,
} from './container';
import Request from './Request';
import { ShortenerStore } from './shorten';

function createApp(container: Container, app?: Express): Express {
	app = app ?? express();

	app.use(bodyParser.text()).use(cookieParser());
	app.use(checkUser);

	async function addRedirect(
		name: string,
		req: Request,
		res: Response
	): Promise<void> {
		try {
			logger.log(
				`Request to add '${name}' -> '${req.body}' for user ${req.locals?.userId}`
			);
			const url = new URL(req.body);
			const entry = await container.store.addRedirect(name, url, {
				userId: req.locals?.userId,
			});

			res.status(200).send(entry);
		} catch (err: any) {
			if (err.message === 'Invalid URL') {
				res.status(400).send('Invalid URL');
			} else {
				res.sendStatus(500);
			}
		}
	}

	app
		.route('/s/:slug')
		.get(async (req: Request, res: Response) => {
			logger.trace(`Getting url for '${req.params.slug}'`);

			const url = await container.store.lookup(req.params.slug);
			if (url) {
				res.redirect(url.url.toString());
			} else {
				res.sendStatus(404);
			}
		})
		.post(async (req: Request, res: Response) => {
			const name = req.params.slug;

			await addRedirect(name, req, res);
		})
		.delete(async (request: Request, response: Response) => {
			if (
				request.locals.isAuthorized &&
				(await container.store.remove(
					request.params.slug,
					request.locals.userId
				))
			) {
				response.sendStatus(200);
			} else {
				response.status(403).send('User is not authorized to delete this URL');
			}
		});

	app
		.route('/s/')
		.get(async (request: Request, response: Response) => {
			logger.trace(`Getting urls for user: ${request.locals.userId}`);

			const urls = await container.store.get(
				request.query.private === undefined ? undefined : request.locals.userId
			);

			if (urls.length === 0) {
				response.sendStatus(204);
			} else {
				response.json(urls);
			}
		})
		.post(async (req: Request, res: Response) => {
			const name = randomString(8);
			logger.log(`No name given. Request to add '${name}' -> '${req.body}'`);
			await addRedirect(name, req, res);
		});

	app.route('/github-callback').get(authCallback);
	return app;
}

interface ServerConfig extends ContainerConfig {
	app?: Express;
	store?: ShortenerStore;
}

export default async (config?: ServerConfig) => {
	const container = await configureContainer(config);
	if (config?.store) {
		container.store = config?.store;
	}

	const app = createApp(container, config?.app);

	return { app, ...container };
};
