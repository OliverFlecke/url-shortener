import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import { randomString } from '../tests/rand';
import configureContainer, {
	Container,
	ContainerConfig,
	logger,
} from './container';

let container: Container;

const app = express();

app.use(bodyParser.text());

async function addRedirect(
	name: string,
	req: Request,
	res: Response
): Promise<void> {
	try {
		const url = new URL(req.body);
		const entry = await container.store.addRedirect(name, url);

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
		logger.trace(`Request to add '${name}' -> '${req.body}'`);
		await addRedirect(name, req, res);
	});

app
	.route('/s/')
	.get(async (_: Request, res: Response) => {
		const urls = await container.store.get();

		if (urls.length === 0) {
			res.sendStatus(204);
		} else {
			res.json(urls);
		}
	})
	.post(async (req: Request, res: Response) => {
		const name = randomString(8);
		logger.trace(`Request to add '${name}' -> '${req.body}'`);
		await addRedirect(name, req, res);
	});

export default async (config?: ContainerConfig) => {
	container = await configureContainer(config);

	return { app, ...container };
};
