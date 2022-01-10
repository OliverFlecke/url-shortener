import { ConsoleLogger, ILogger, LogLevel } from './logger';
import { ShortenerStore } from './shorten';
import InMemoryShortenerStore, {
	InMemoryConfig,
} from './shorten/stores/InMemoryShortenerStore';
import MongoUrlStore, { MongoDbConfig } from './shorten/stores/MongoUrlStore';

export let logger: ILogger = console;

export interface ContainerConfig {
	logLevel?: LogLevel;
	store?: DBConfig;
}

export interface Container {
	logger: ILogger;
	store: ShortenerStore;
}

export type DBConfig = MongoDbConfig | InMemoryConfig;

export default async function (config?: ContainerConfig): Promise<Container> {
	logger = new ConsoleLogger(config?.logLevel ?? LogLevel.None);
	const store = await createStore(config?.store);

	return { logger, store };
}

function createStore(config?: DBConfig): Promise<ShortenerStore> {
	switch (config?.type) {
		case 'MongoDb':
			return MongoUrlStore.create(config);

		case 'In memory':
		default:
			return Promise.resolve(new InMemoryShortenerStore());
	}
}
