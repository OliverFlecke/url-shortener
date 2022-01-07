import app from '../server/apiApp';
import request from 'supertest';

describe('GET /s/', () => {
	test('unable to find key', (done) => {
		request(app).get('/s/xyz').expect(404, done);
	});

	test('Getting key successfully', (done) => {
		request(app)
			.get('/s/abc')
			.expect(302)
			.expect('Found. Redirecting to https://google.com')
			.end(done);
	});
});
