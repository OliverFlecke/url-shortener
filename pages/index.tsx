import { GetServerSideProps } from 'next';
import React, { useCallback, useRef } from 'react';
import { User } from '../server/auth';
import AddUrlForm from '../src/components/AddUrlForm';
import Nav from '../src/components/Nav';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';
import UserContext from '../src/contexts/UserContext';
import { randomString } from '../tests/rand';

interface Props {
	client_id?: string;
	redirect_uri?: string;
	state?: string;
	user: User | null;
}

export default function Home(props: Props) {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);

	return (
		<>
			<UserContext.Provider
				value={{ isAuthorized: props.user !== null, user: props.user }}
			>
				<Nav {...props} />
				<AddUrlForm refresh={refresh} />
				<ShortenedUrlList ref={listRef} />
			</UserContext.Provider>
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
					? null
					: JSON.parse(context.req.cookies.USER),
		},
	};
};
