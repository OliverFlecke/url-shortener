import { createServer } from 'http';
import express, { Response } from 'express';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
	const app = express();
	const server = createServer(app);

	app.get('/hello', async (_, res: Response) => {
		res.send('Hello world!');
	});

	app.all('*', (req, res) => nextHandler(req, res));

	server.listen(port, () => {
		console.log(`>> Ready on port ${port}`);
	});
});
