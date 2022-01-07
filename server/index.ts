import { createServer } from 'http';
import express, { Response, Request } from 'express';
import next from 'next';
import { lookup, addRedirect } from './shorten';
import { UrlNotFoundError } from './shorten/errors';
import { URL } from 'url';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
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
			console.debug(req.body);
			const url = new URL(req.body);
			addRedirect(req.params.slug, url);

			res.sendStatus(200);
		});

	app.all('*', (req, res) => nextHandler(req, res));

	const server = createServer(app);
	server.listen(port, () => {
		console.log(`>> Ready on port ${port}`);
	});
});
