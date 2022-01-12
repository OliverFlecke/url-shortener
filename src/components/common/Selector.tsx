import React from 'react';

interface SelectorProps<T> {
	options: T[];
	setState: (value: T) => void;
	selected?: T;
}

export function Selector<T>({ options, setState, selected }: SelectorProps<T>) {
	return (
		<span className="inline-block border-2 border-gray-400 rounded my-2">
			{options.map((option) => (
				<button
					key={(option as any).toString()}
					onClick={() => setState(option)}
					className={`inline-block w-20 px-2 py-1 h-full border-r-2 border-current last:border-none${
						selected === option ? ' bg-indigo-700' : ' text-secondary'
					}`}
				>
					{option}
				</button>
			))}
		</span>
	);
}
