import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'src/compiled.css';
import { sky } from 'tailwindcss/colors';

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<title>Shorten URL</title>
				<meta name="description" content="URL Shortener" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/logo192.png" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content={sky[600]}
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content={sky[900]}
				/>
				<meta name="color-scheme" content="dark light" />
			</Head>
			<main className="min-h-screen h-full bg-gradient-to-b dark:to-gray-900 dark:from-sky-900 from-gray-100 to-sky-600">
				<Component {...pageProps} />
			</main>
		</>
	);
}
