import React, { useCallback, useRef } from 'react';
import AddUrlForm from '../src/components/AddUrlForm';
import ShortenedUrlList, {
	ShortenedUrlListFuncs,
} from '../src/components/ShortenedUrlList';

export default function Home() {
	const listRef = useRef<ShortenedUrlListFuncs>(null);
	const refresh = useCallback(
		() => listRef.current?.refresh() ?? Promise.resolve(),
		[]
	);

	return (
		<>
			<AddUrlForm refresh={refresh} />
			<ShortenedUrlList ref={listRef} />
		</>
	);
}
