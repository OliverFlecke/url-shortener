export interface ILogger {
	trace: (message: string) => void;
	debug: (message: string) => void;
	log: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
}

export enum LogLevel {
	None = 0,
	Error = 1,
	Warn = 2,
	Info = 3,
	Debug = 4,
	Trace = 5,
}
export class ConsoleLogger implements ILogger {
	level: LogLevel;

	constructor(level?: LogLevel) {
		this.level = level ?? LogLevel.Debug;
	}

	private output(level: LogLevel, message: string) {
		if (level > this.level) return;

		const timestamp = new Date(Date.now()).toISOString();
		switch (level) {
			case LogLevel.Trace:
				console.trace(`${timestamp}: [TRC] ${message}`);
				break;
			case LogLevel.Debug:
				console.debug(`${timestamp}: [DBG] ${message}`);
				break;
			case LogLevel.Info:
				console.log(`${timestamp}: [INF] ${message}`);
				break;
			case LogLevel.Warn:
				console.warn(`${timestamp}: [WAR] ${message}`);
				break;
			case LogLevel.Error:
				console.error(`${timestamp}: [ERR] ${message}`);
				break;
		}
	}

	trace(message: string) {
		this.output(LogLevel.Trace, message);
	}
	debug(message: string) {
		this.output(LogLevel.Debug, message);
	}
	log(message: string) {
		this.output(LogLevel.Info, message);
	}
	warn(message: string) {
		this.output(LogLevel.Warn, message);
	}
	error(message: string) {
		this.output(LogLevel.Error, message);
	}
}
