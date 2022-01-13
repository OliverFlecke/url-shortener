import { arrowDown, copy, trash } from 'ionicons/icons';
import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';
import ShortenedUrl from '../models/ShortenedUrl';
import Icon from './common/Icon';
import { Selector } from './common/Selector';
import Tooltip from './common/Tooltip';
import { Spinner } from './common/Spinner';
import UserContext from '../contexts/UserContext';

type LinkType = 'All' | 'Private';

const NoLinks: React.FC = () => (
	<div className="text-secondary">No active links</div>
);

const List: React.FC<{
	urls: ShortenedUrl[];
	urlType: LinkType;
	refresh: () => void;
}> = ({ urls, urlType, refresh }) => (
	<ul className="rounded-md mt-2 space-y-4">
		{urls.map((x) => (
			<UrlRow key={x.name} url={x} urlType={urlType} refresh={refresh} />
		))}
	</ul>
);

const UrlRow: React.FC<{
	url: ShortenedUrl;
	urlType: LinkType;
	refresh: () => void;
}> = ({ url, urlType, refresh }) => {
	const shortUrl = `${window.location.origin}/s/${url.name}`;
	const copyUrl = useCallback(
		() => navigator.clipboard.writeText(shortUrl),
		[shortUrl]
	);
	const deleteUrl = useCallback(async () => {
		try {
			const res = await fetch(`/s/${url.name}`, {
				method: 'DELETE',
			});
			if (res.status === 200) {
				refresh();
			} else {
				alert(`Failed to delete ${url.url.toString()}`);
			}
		} catch (e) {
			console.error(e);
		}
	}, [refresh, url.name, url.url]);

	return (
		<li className="rounded-md bg-green-800 p-4 flex flex-col justify-between items-center">
			<span className="flex w-full justify-between space-x-4 sm:w-auto text-white">
				<span>{shortUrl}</span>
				<div className="flex flex-row space-x-4">
					<button
						onClick={copyUrl}
						aria-label="Copy url"
						className="flex items-center"
					>
						<Tooltip>
							<Icon icon={copy} className="text-current" />
							<Tooltip.Text>Copy to clipboard</Tooltip.Text>
						</Tooltip>
					</button>
					<button onClick={deleteUrl} aria-label="Delete url">
						<Icon
							icon={trash}
							className={urlType === 'Private' ? 'text-red-500' : 'hidden'}
						/>
					</button>
				</div>
			</span>
			<Icon icon={arrowDown} className="text-white" />
			<a href={url.url.toString()} className="underline text-sky-200">
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
	const [urls, setUrls] = useState<ShortenedUrl[] | null>(null);
	const [urlType, setUrlType] = useState<LinkType>('All');

	const getUrls = useCallback(async () => {
		setUrls(null);
		const res = await fetch(urlType === 'Private' ? '/s?private' : '/s/');
		if (res.status === 200) {
			setUrls(await res.json());
		} else if (res.status === 204) {
			setUrls([]);
		}
	}, [setUrls, urlType]);

	useImperativeHandle(
		ref,
		() =>
			({
				refresh: getUrls,
			} as ShortenedUrlListFuncs)
	);

	useEffect(() => {
		getUrls();
	}, [getUrls, urlType]);

	const { isAuthorized } = useContext(UserContext);

	return (
		<div className="max-w-full flex flex-col items-center pb-4 m-4 sm:m-0">
			<div className="w-full max-w-lg">
				<h2 className="text-xl">Active links</h2>
				{isAuthorized && (
					<Selector
						options={['All', 'Private']}
						selected={urlType}
						setState={setUrlType}
					/>
				)}

				{urls === null ? (
					<div className="w-full flex justify-center py-4">
						<Spinner />
					</div>
				) : urls.length === 0 ? (
					<NoLinks />
				) : (
					<List urls={urls} urlType={urlType} refresh={getUrls} />
				)}
			</div>
		</div>
	);
});
ShortenedUrlListContainer.displayName = 'ShortenedUrlListContainer';

export interface ShortenedUrlListFuncs {
	refresh: () => Promise<void>;
}

export default ShortenedUrlListContainer;
