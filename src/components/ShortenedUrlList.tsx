import { arrowForward, copy } from 'ionicons/icons';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';
import ShortenedUrl from '../models/ShortenedUrl';
import Icon from './Icon';
import Tooltip from './Tooltip';

/**
 * Pure component to render a list of shortened URLs.
 */
const ShortenedUrlList: React.FC<{
	urls: ShortenedUrl[];
}> = ({ urls }) => (
	<div className="max-w-full flex flex-col items-center pb-4 m-4 sm:m-0">
		<div className="w-full max-w-lg">
			<h3 className="text-xl">Active links</h3>
			{urls.length === 0 ? <NoLinks /> : <List urls={urls} />}
		</div>
	</div>
);

const NoLinks: React.FC = () => (
	<span className="text-secondary">No active links</span>
);

const List: React.FC<{ urls: ShortenedUrl[] }> = ({ urls }) => (
	<ul className="rounded-md mt-2 p-4 space-y-4 bg-gray-700">
		{urls.map((x) => (
			<UrlRow key={x.name} url={x} />
		))}
	</ul>
);

const UrlRow: React.FC<{ url: ShortenedUrl }> = ({ url }) => {
	const shortUrl = `${window.location.origin}/${url.name}`;
	const copyUrl = useCallback(
		() => navigator.clipboard.writeText(shortUrl),
		[shortUrl]
	);

	return (
		<li className="rounded-md bg-green-800 p-4 flex justify-between items-center">
			<span className="flex space-x-2">
				<span>{shortUrl}</span>
				<button onClick={copyUrl} className="flex items-center">
					<Tooltip>
						<Icon icon={copy} />
						<Tooltip.Text>Copy to clipboard</Tooltip.Text>
					</Tooltip>
				</button>
			</span>
			<Icon icon={arrowForward} />
			<a href={url.url.toString()} className="underline">
				{url.url.toString()}
			</a>
		</li>
	);
};

/**
 * Component to render the list of shortened urls.
 * Contains and handles the state sync with the backend.
 *
 * To refresh the list of links, call the `refresh` function on the component's ref.
 *
 * @returns A React component with a list of shortened URLs.
 */
const ShortenedUrlListContainer = forwardRef((_, ref) => {
	const [urls, setUrls] = useState<ShortenedUrl[]>([]);

	const getUrls = useCallback(async () => {
		const res = await fetch('/s/');
		if (res.status === 200) {
			setUrls(await res.json());
		}
	}, [setUrls]);

	useImperativeHandle(
		ref,
		() =>
			({
				refresh: getUrls,
			} as ShortenedUrlListFuncs)
	);

	useEffect(() => {
		getUrls();
	}, [getUrls]);

	return <ShortenedUrlList urls={urls} />;
});
ShortenedUrlListContainer.displayName = 'ShortenedUrlListContainer';

export interface ShortenedUrlListFuncs {
	refresh: () => Promise<void>;
}

export default ShortenedUrlListContainer;
