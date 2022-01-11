import React, { useCallback, useRef } from 'react';
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI } from '../server/config';
import AddUrlForm from '../src/components/AddUrlForm';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';
import { randomString } from '../tests/rand';

export default function Home() {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);

	const state = randomString(16);
	const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&state=${state}`;

	return (
		<>
			<a href={url}>Login</a>
			<AddUrlForm refresh={refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}
