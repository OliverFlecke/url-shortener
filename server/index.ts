import { createServer } from 'http';
import next from 'next';
import createApp from './api';
import { logger } from './container';

const port = parseInt(process.env.PORT || '3000');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
	const app = createApp();
	app.all('*', (req, res) => nextHandler(req, res));

	const server = createServer(app);
	server.listen(port, () => {
		logger.log(`Ready on port ${port}`);
	});
});
