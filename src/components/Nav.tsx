import React, { useContext } from 'react';
import { User } from '../../server/auth';
import UserContext from '../contexts/UserContext';

export interface NavProps {
	client_id?: string;
	redirect_uri?: string;
	state?: string;
}

export default function Nav({ client_id, redirect_uri, state }: NavProps) {
	const { user } = useContext(UserContext);

	return (
		<nav className="w-full flex justify-center">
			<h1 className="pt-4 text-center text-3xl md:text-4xl">Shorten URL</h1>
			<div className="absolute right-0 top-0">
				{user === null ? (
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
		<a href={url} className="btn btn-green inline-block m-2">
			Login
		</a>
	);
};
