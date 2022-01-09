import { ConsoleLogger, ILogger, LogLevel } from './logger';
import { ShortenerStore } from './shorten';
import InMemoryShortenerStore from './shorten/InMemoryShortenerStore';
import MongoUrlStore from './shorten/MongoUrlStore';

export let logger: ILogger = console;

export interface ContainerConfig {
	logLevel?: LogLevel;
	storeType?: StoreType;
}

export interface Container {
	logger: ILogger;
	store: ShortenerStore;
}

export default async function (config?: ContainerConfig): Promise<Container> {
	logger = new ConsoleLogger(config?.logLevel ?? LogLevel.None);
	const store = await createStore(config?.storeType);

	return { logger, store };
}

type StoreType = 'In memory' | 'MongoDB';

function createStore(type?: StoreType): Promise<ShortenerStore> {
	switch (type) {
		case 'MongoDB':
			return MongoUrlStore.create();

		case 'In memory':
		default:
			return Promise.resolve(new InMemoryShortenerStore());
	}
}
