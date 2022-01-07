import AddUrl from '../src/components/AddUrl';
import ShortenedUrlList from '../src/components/ShortenedUrlList';

export default function Home() {
	return (
		<div>
			<AddUrl />
			<ShortenedUrlList
				urls={[
					{
						name: 'abc',
						url: new URL('https://abc.com'),
					},
					{
						name: 'xyz',
						url: new URL('https://xyz.com'),
					},
				]}
			/>
		</div>
	);
}
