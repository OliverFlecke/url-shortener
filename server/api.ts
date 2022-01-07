import express, { Request, Response } from 'express';
import configureContainer, { ContainerConfig, logger } from './container';
import { addRedirect, lookup } from './shorten';
import { UrlNotFoundError } from './shorten/errors';

const app = express();
app
	.route('/s/:slug')
	.get(async (req: Request, res: Response) => {
		try {
			const url = await lookup(req.params.slug);
			res.redirect(url);
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
		await addRedirect(req.params.slug, url);

		res.sendStatus(200);
	});

interface ServerConfig extends ContainerConfig {}

export default (config?: ServerConfig) => {
	configureContainer(config);

	return app;
};
