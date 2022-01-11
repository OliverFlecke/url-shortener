import React, { useCallback, useRef } from 'react';

async function saveUrl(url: URL, key?: string): Promise<void> {
	const endpoint = key ? `/s/${key}` : '/s/';
	await fetch(endpoint, {
		method: 'POST',
		body: url.toString(),
	});
}

const AddUrlForm: React.FC<{ refresh?: () => Promise<void> }> = ({
	refresh,
}) => {
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
				refresh?.();

				input.value = '';
				if (nameInputRef.current) {
					nameInputRef.current.value = '';
				}
			} catch (err) {
				console.error(err);
				alert('You did not provide a valid url');
			}
		}
	}, [refresh]);

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
			<h2 className="pt-4 text-center text-3xl md:text-4xl">Shorten URL</h2>
			<label className="styled">
				<span>Short name</span>
				<input
					ref={nameInputRef}
					onKeyPress={handleKeyPress}
					placeholder="(Optional) Custom short name"
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
			<button
				onClick={onAdd}
				type="button"
				className="btn w-full sm:w-auto mt-2"
			>
				Add
			</button>
		</div>
	);
};

export default AddUrlForm;
