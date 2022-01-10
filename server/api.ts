import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import configureContainer, {
	Container,
	ContainerConfig,
	logger,
} from './container';

let container: Container;

const app = express();

app.use(bodyParser.text());

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
		logger.trace(`Request to add '${req.params.slug}' -> '${req.body}'`);
		try {
			const url = new URL(req.body);
			await container.store.addRedirect(req.params.slug, url);

			res.sendStatus(200);
		} catch (err: any) {
			if (err.message === 'Invalid URL') {
				res.status(400).send('Invalid URL');
			} else {
				res.sendStatus(500);
			}
		}
	});

app.route('/s/').get(async (_: Request, res: Response) => {
	const urls = await container.store.get();

	if (urls.length === 0) {
		res.sendStatus(204);
	} else {
		res.json(urls);
	}
});

export default async (config?: ContainerConfig) => {
	container = await configureContainer(config);

	return { app, ...container };
};
