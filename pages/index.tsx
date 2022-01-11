import { GetServerSideProps } from 'next';
import React, { useCallback, useRef } from 'react';
import AddUrlForm from '../src/components/AddUrlForm';
import Nav, { NavProps } from '../src/components/Nav';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';
import { randomString } from '../tests/rand';

export default function Home(props: NavProps) {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);

	return (
		<>
			<Nav {...props} />
			<AddUrlForm refresh={refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
			redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
			state: randomString(16),
			user:
				context.req.cookies.USER === undefined
					? undefined
					: JSON.parse(context.req.cookies.USER),
		},
	};
};
