import React, { useCallback, useRef } from 'react';

async function saveUrl(url: URL, key?: string): Promise<void> {
	await fetch(`s/${key ?? 'aaa'}`, {
		method: 'POST',
		body: url.toString(),
	});
}

function AddUrl() {
	const urlInputRef = useRef<HTMLInputElement>(null);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const onAdd = useCallback(async () => {
		const input = urlInputRef.current;
		if (input && input.value !== '') {
			try {
				const url = new URL(input.value);
				const key =
					nameInputRef.current?.value === ''
						? undefined
						: nameInputRef.current?.value;

				await saveUrl(url, key);
				input.value = '';
			} catch {
				alert('You did not provide a valid url');
			}
		}
	}, []);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				onAdd();
			}
		},
		[onAdd]
	);

	return (
		<div className="flex flex-col items-center px-4">
			<h2 className="pt-4 text-center text-3xl md:text-4xl">
				Create shortened URL
			</h2>
			<label className="styled">
				<span>Short name</span>
				<input
					ref={nameInputRef}
					onKeyPress={handleKeyPress}
					placeholder="Custom short name"
				/>
			</label>
			<label className="styled">
				<span>URL</span>
				<input
					ref={urlInputRef}
					onKeyPress={handleKeyPress}
					placeholder="URL to shorten"
				/>
			</label>
			<button onClick={onAdd} type="button" className="btn">
				Add
			</button>
		</div>
	);
}

export default AddUrl;
