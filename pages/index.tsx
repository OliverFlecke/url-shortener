import React, { useCallback, useRef } from 'react';
import AddUrlForm from '../src/components/AddUrlForm';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';
import { randomString } from '../tests/rand';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_ID;
const baseUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}`;
const url = `${baseUrl}&state=${randomString(16)}`;

export default function Home() {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);

	return (
		<>
			<a href={url}>Login</a>
			<AddUrlForm refresh={refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}
