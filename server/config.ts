import { ContainerConfig, DBConfig } from './container';
import { LogLevel } from './logger';

function readDbConfig(env: NodeJS.ProcessEnv): DBConfig {
	switch (env.DB_TYPE) {
		case 'InMemory':
			return { type: 'In memory' };
		default:
			return {
				type: 'MongoDb',
				host: env.DB_HOST || 'localhost',
				port: parseInt(env.DB_PORT || '27017'),
			};
	}
}

function parseLogLevel(env: NodeJS.ProcessEnv): LogLevel {
	switch (env.LOG_LEVEL?.toString().toLowerCase()) {
		case '0':
		case 'none':
			return LogLevel.None;
		case '1':
		case 'error':
			return LogLevel.Error;
		case '2':
		case 'warn':
			return LogLevel.Warn;

		case '4':
		case 'debug':
			return LogLevel.Debug;

		case '5':
		case 'trace':
			return LogLevel.Trace;

		case '3':
		case 'info':
		default:
			return LogLevel.Info;
	}
}

export function parseConfig(env: NodeJS.ProcessEnv): ContainerConfig {
	return {
		logLevel: parseLogLevel(env),
		store: readDbConfig(env),
	};
}
