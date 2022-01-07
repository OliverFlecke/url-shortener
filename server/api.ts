import express, { Request, Response } from 'express';
import configureContainer, { Container, ContainerConfig, logger } from './container';
import { UrlNotFoundError } from './shorten/errors';
import bodyParser from 'body-parser';

let container: Container;

const app = express();

app.use(bodyParser.text());

app
	.route('/s/:slug')
	.get(async (req: Request, res: Response) => {
		logger.trace(`Getting url for '${req.params.slug}'`);
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
		logger.trace(`Request to add '${req.params.slug}' -> '${req.body}'`);
		const url = new URL(req.body);
		await container.store.addRedirect(req.params.slug, url);

		res.sendStatus(200);
	});

interface ServerConfig extends ContainerConfig {}

export default (config?: ServerConfig) => {
	container = configureContainer(config);

	return { app, ...container };
};
