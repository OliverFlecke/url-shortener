import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import 'src/compiled.css';

const Layout = function ({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="theme-color"
					media="(prefers-color-scheme: light)"
					content="#FFF"
				/>
				<meta
					name="theme-color"
					media="(prefers-color-scheme: dark)"
					content="#000"
				/>
				<meta name="description" content="URL Shortener" />
				<link rel="apple-touch-icon" href="/logo192.png" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="color-scheme" content="dark light" />
			</Head>
			<main className="min-h-screen h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200">
				<Component {...pageProps} />
			</main>
		</>
	);
};

export default Layout;
