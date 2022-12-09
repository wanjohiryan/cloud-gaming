import type { AppProps } from 'next/app';
import Head from "next/head"
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
          name="viewport"
        />
        <title>Play games, with your friends, right from the browser | qwantify</title>
        <link
          rel="preload"
          href="/fonts/NunitoSans-Regular.ttf"
          as="font"
          crossOrigin=""
        />
        <link rel="shortcut icon" href="/logo.png" />
        <link
          rel="preload"
          href="/fonts/Aileron-Bold.otf"
          as="font"
          crossOrigin=""
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
