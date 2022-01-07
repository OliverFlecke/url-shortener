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
		<ul>
			{urls.map((x) => (
				<li key={x.name}>
					{x.name} - <a href={x.url.toString()}>{x.url.toString()}</a>
				</li>
			))}
		</ul>
	);
};

export default ShortenedUrlList;
