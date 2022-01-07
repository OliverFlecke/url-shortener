import React, { useCallback, useRef } from 'react';

const AddUrl: React.FC = () => {
	const urlInputRef = useRef<HTMLInputElement>(null);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const onAdd = useCallback(async () => {
		const input = urlInputRef.current;
		if (input && input.value !== '') {
			try {
				const url = new URL(input.value);
				const key = nameInputRef.current?.value === '' ? undefined : nameInputRef.current?.value;

				await saveUrl(url, key);
				input.value = '';
			} catch {
				alert('You did not provide a valid url');
			}
		}
	}, [urlInputRef, nameInputRef]);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				onAdd();
			}
		},
		[onAdd]
	);

	return (
		<div>
			<h2>Create shortened URL</h2>
			<label>
				<span>Short name</span>
				<input ref={nameInputRef} onKeyPress={handleKeyPress} />
			</label>
			<label>
				<span>URL</span>
				<input ref={urlInputRef} onKeyPress={handleKeyPress} />
			</label>
			<button type='button' onClick={onAdd}>
				Add
			</button>
		</div>
	);
};

export default AddUrl;

async function saveUrl(url: URL, key?: string): Promise<void> {
	await fetch(`s/${key ?? 'aaa'}`, {
		method: 'POST',
		body: url.toString(),
	});
}
