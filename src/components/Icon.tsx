import React from 'react';

const Icon: React.FC<{ icon: string }> = ({ icon }) => (
	<span
		className="inline-block w-6 text-black dark:text-white"
		dangerouslySetInnerHTML={{
			__html: icon.replace('data:image/svg+xml;utf8,', ''),
		}}
	></span>
);

export default Icon;
