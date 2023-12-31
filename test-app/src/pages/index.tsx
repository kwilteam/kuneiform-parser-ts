import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { WebParser } from '@lukelamey/kf-parser-ts'

const inter = Inter({ subsets: ['latin'] })

async function loadP(): Promise<WebParser> {
  return await WebParser.load({
    corsProxyUrl: 'https://cors-anywhere.herokuapp.com/',
  });
}

export default function Home() {
  const [output, setOutput] = useState<string>('')
  const [parser, setParser] = useState<WebParser | null>(null)
  
  useEffect(() => {
    if (!parser) {
      loadP().then((p) => {
        setParser(p);
      });
    }
  });

  async function goParse() {
    if (parser) {
      const text = await fetch('test.kf')
        .then((res) => { return res.text()} )
        const res = await parser.parse(text);
        setOutput(JSON.stringify(res));
    } else {
      setOutput('Parser not loaded. Please try again in a moment.');
    }
  }

  return (
    <>
      <Head>
        <title>Test Kuneiform Parser</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <h1>Click button to compile</h1>
          <button
            onClick={() => goParse()}
          >Compile me</button>
          <h2>Result</h2>
          <p>{output}</p>
        </div>
      </main>
    </>
  )
}