import { ConsoleLogger, ILogger, LogLevel } from './logger';
import { ShortenerStore } from './shorten';
import InMemoryShortenerStore from './shorten/InMemoryShortenerStore';

export let logger: ILogger = console;

export interface ContainerConfig {
	logLevel?: LogLevel;
}

export interface Container {
	logger: ILogger;
	store: ShortenerStore;
}

export default function (config?: ContainerConfig): Container {
	logger = new ConsoleLogger(config?.logLevel ?? LogLevel.None);
	const store = new InMemoryShortenerStore();

	return { logger, store };
}
