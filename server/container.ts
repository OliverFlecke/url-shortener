import { ConsoleLogger, ILogger, LogLevel } from './logger';
import { ShortenerStore } from './shorten';
import InMemoryShortenerStore from './shorten/InMemoryShortenerStore';

export let logger: ILogger = console;

export interface ContainerConfig {
	logger?: ILogger;
}

export interface Container {
	logger: ILogger;
	store: ShortenerStore;
}

export default function (config?: ContainerConfig): Container {
	logger = config?.logger ?? new ConsoleLogger(LogLevel.Debug);
	const store = new InMemoryShortenerStore();

	return { logger, store };
}
