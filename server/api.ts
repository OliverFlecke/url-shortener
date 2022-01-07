import express, { Request, Response } from 'express';
import configureContainer, { Container, ContainerConfig, logger } from './container';
import { UrlNotFoundError } from './shorten/errors';

const app = express();
let container: Container;

app
	.route('/s/:slug')
	.get(async (req: Request, res: Response) => {
		try {
			const url = await container.store.lookup(req.params.slug);
			res.redirect(url.toString());
		} catch (err) {
			if (err instanceof UrlNotFoundError) {
				res.sendStatus(404);
			} else {
				res.sendStatus(500);
			}
		}
	})
	.post(async (req: Request, res: Response) => {
		logger.debug(req.body);
		const url = new URL(req.body);
		await container.store.addRedirect(req.params.slug, url);

		res.sendStatus(200);
	});

interface ServerConfig extends ContainerConfig {}

export default (config?: ServerConfig) => {
	container = configureContainer(config);

	return { app, ...container };
};
