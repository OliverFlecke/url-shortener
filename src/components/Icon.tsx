import React from 'react';

const Icon: React.FC<{ icon: string; className?: string }> = ({
	icon,
	className,
}) => (
	<span
		className={
			'inline-block w-6 text-black dark:text-white' +
			(className ? ` ${className}` : '')
		}
		dangerouslySetInnerHTML={{
			__html: icon.replace('data:image/svg+xml;utf8,', ''),
		}}
	></span>
);

export default Icon;
