import { ConsoleLogger, ILogger, LogLevel } from './logger';

export let logger: ILogger = console;

export interface ContainerConfig {
	logger?: ILogger;
}

export default function (config?: ContainerConfig) {
	logger = config?.logger ?? new ConsoleLogger(LogLevel.Debug);
}
