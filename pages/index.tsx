import React, { useRef } from 'react';
import AddUrlForm from '../src/components/AddUrlForm';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';

export default function Home() {
	const listRef = useRef<ShortenedUrlListFuncs>(null);

	return (
		<>
			<AddUrlForm refresh={listRef.current?.refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}
