export interface ILogger {
	trace: (message: any) => void;
	debug: (message: any) => void;
	log: (message: any) => void;
	warn: (message: any) => void;
	error: (message: any) => void;
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

	private output(level: LogLevel, message: any) {
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

	trace(message: any) {
		this.output(LogLevel.Trace, message);
	}

	debug(message: any) {
		this.output(LogLevel.Debug, message);
	}

	log(message: any) {
		this.output(LogLevel.Info, message);
	}

	warn(message: any) {
		this.output(LogLevel.Warn, message);
	}

	error(message: any) {
		this.output(LogLevel.Error, message);
	}
}
