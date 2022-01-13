import { NextFunction, Response } from 'express';
import Request from '../../server/Request';

export function mockAuth(userId: number) {
	return (request: Request, _: Response, next: NextFunction) => {
		request.locals = {
			isAuthorized: true,
			userId,
		};
		next();
	};
}
