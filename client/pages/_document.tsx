/* eslint-disable @next/next/next-script-for-ga */
import { Children } from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { AppRegistry } from 'react-native'
import config from '../app.json'
// Force Next-generated DOM elements to fill their parent's height
const normalizeNextElements = `
  #__next {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`

const backgroundColor = "#000"

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }: any) {
    AppRegistry.registerComponent(config.name, () => Main)
    // @ts-ignore
    const { getStyleElement } = AppRegistry.getApplication(config.name)
    const page = await renderPage()
    const styles = [
      // eslint-disable-next-line react/jsx-key
      <style dangerouslySetInnerHTML={{ __html: normalizeNextElements }} />,
      getStyleElement(),
    ]
    return { ...page, styles: Children.toArray(styles) }
  }

  render() {
    return (
      <Html style={{ height: '100%', backgroundColor }}>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/logo.png" />
          <link rel="apple-touch-icon" href="/logo.png"></link>
          <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"></link>
          <meta name="theme-color" content={backgroundColor} />
        </Head>
        <body style={{ height: '100%', overflow: 'hidden', backgroundColor }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}