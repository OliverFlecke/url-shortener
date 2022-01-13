import { createContext } from 'react';
import { User } from '../../server/auth';

interface UserContext {
	isAuthorized: boolean;
	user: User | null;
}

export default createContext<UserContext>({
	isAuthorized: false,
	user: null,
});
