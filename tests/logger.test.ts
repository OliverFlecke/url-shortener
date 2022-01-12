import { ConsoleLogger, LogLevel } from '../server/logger';
import { randomString } from './rand';

describe('Logger', () => {
	test.each([
		[LogLevel.Trace],
		[LogLevel.Debug],
		[LogLevel.Info],
		[LogLevel.Warn],
		[LogLevel.Error],
	])('log each level', (level) => {
		const callback = jest.fn((_) => {});
		const msg = randomString();
		const logger = new ConsoleLogger(level);

		console = {} as any;
		switch (level) {
			case LogLevel.Trace:
				console.trace = callback;
				logger.trace(msg);
				break;
			case LogLevel.Debug:
				console.debug = callback;
				logger.debug(msg);
				break;
			case LogLevel.Info:
				console.log = callback;
				logger.log(msg);
				break;
			case LogLevel.Warn:
				console.warn = callback;
				logger.warn(msg);
				break;
			case LogLevel.Error:
				console.error = callback;
				logger.error(msg);
				break;
		}

		expect(callback.mock.calls.length).toBe(1);
		expect(callback.mock.calls[0][0]).toContain(msg);
	});

	test('default log level should be debug', () => {
		const debugCallback = jest.fn((_) => {});
		const traceCallback = jest.fn((_) => {});
		const msg = randomString();
		const logger = new ConsoleLogger();

		console = {} as any;
		console.debug = debugCallback;
		console.trace = traceCallback;

		logger.trace(randomString());
		logger.debug(msg);

		expect(debugCallback.mock.calls.length).toBe(1);
		expect(debugCallback.mock.calls[0][0]).toContain(msg);
		expect(traceCallback.mock.calls.length).toBe(0);
	});
});
