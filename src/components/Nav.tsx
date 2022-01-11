import { GetStaticProps } from 'next';
import React from 'react';
import { User } from '../../server/auth';
import { randomString } from '../../tests/rand';

export interface NavProps {
	client_id?: string;
	redirect_uri?: string;
	state?: string;
	user?: User;
}

export default function Nav({
	user,
	client_id,
	redirect_uri,
	state,
}: NavProps) {
	return (
		<nav className="w-full flex justify-center">
			<h1 className="pt-4 text-center text-3xl md:text-4xl">Shorten URL</h1>
			<div className="absolute right-0">
				{user === undefined ? (
					<LoginButton
						client_id={client_id}
						redirect_uri={redirect_uri}
						state={state}
					/>
				) : (
					<UserView user={user} />
				)}
			</div>
		</nav>
	);
}

export const getStaticProps: GetStaticProps = async (_) => {
	return {
		props: {
			client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
			redirect_uri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI,
			state: randomString(16),
		},
	};
};

const UserView: React.FC<{ user: User }> = ({ user }) => (
	<>
		<img src={user.avatar_url} className="rounded-full w-12 m-4" />
	</>
);

const LoginButton: React.FC<{
	client_id?: string;
	redirect_uri?: string;
	state?: string;
}> = ({ client_id, redirect_uri, state }) => {
	const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`;

	return (
		<a href={url} className="decoration-transparent p-4">
			Login
		</a>
	);
};
