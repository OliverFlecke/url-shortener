import React from 'react';

interface ShortenedUrl {
	name: string;
	url: URL;
	// createdOn: Date;
}
interface ShortenedUrlListProps {
	urls: ShortenedUrl[];
}

const ShortenedUrlList: React.FC<ShortenedUrlListProps> = ({ urls }) => {
	return (
		<div className="max-w-screen m-4">
			<h3 className="text-xl">Active links</h3>
			<ul className="rounded-md mt-2 p-4 space-y-4 bg-gray-700">
				{urls.map((x) => (
					<li
						key={x.name}
						className="rounded-md bg-green-800 p-4 flex justify-between"
					>
						<span>{x.name}</span>
						<a href={x.url.toString()}>{x.url.toString()}</a>
					</li>
				))}
			</ul>
		</div>
	);
};

export default ShortenedUrlList;
