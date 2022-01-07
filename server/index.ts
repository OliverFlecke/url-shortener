import { createServer } from 'http';
import next from 'next';
import app from './apiApp';

const port = parseInt(process.env.PORT || '3000');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
	app.all('*', (req, res) => nextHandler(req, res));

	const server = createServer(app);
	server.listen(port, () => {
		console.log(`>> Ready on port ${port}`);
	});
});
