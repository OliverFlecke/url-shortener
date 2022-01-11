import React, { useCallback, useRef } from 'react';
import AddUrlForm from '../src/components/AddUrlForm';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';
import { randomString } from '../tests/rand';

interface Props {
	client_id: string;
	redirect_uri: string;
	state: string;
}
export default function Home({ client_id, redirect_uri, state }: Props) {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);
	const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`;

	return (
		<>
			<a href={url} className="btn">
				Login
			</a>
			<AddUrlForm refresh={refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}

export async function getStaticProps() {
	return {
		props: {
			client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
			redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
			state: randomString(16),
		},
	};
}
