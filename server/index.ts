import { createServer } from 'http';
import next from 'next';
import createApp from './api';
import { parseConfig } from './configParser';

const port = parseInt(process.env.PORT || '3000');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
	try {
		const { app, logger } = await createApp(parseConfig(process.env));

		app.all('*', (req, res) => nextHandler(req, res));

		const server = createServer(app);
		server.listen(port, () => {
			logger.log(`Ready on port ${port}`);
		});
	} catch (err) {
		console.error(`Failed to start server: ${err}`);
	}
});
