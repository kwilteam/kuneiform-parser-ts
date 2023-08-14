# Kwil Kuneiform Parser (JS / TS)

This package allows developers to compile raw [Kuneiform](https://docs.kwil.com/docs/kuneiform/introduction) code in Browser and NodeJS applications.

The Kuneiform Parser parses raw Kuneiform to JSON, which can be used to deploy a database on Kwil with the [Kwil-JS SDK](https://www.npmjs.com/package/kwil). This is an alternative to using the [Kuneiform IDE](https://ide.kwil.com/) or [Kwil CLI](https://docs.kwil.com/docs/cli/databases#deploy) to deploy a database on Kwil.

## How it works

This package downloads the latest production-version WASM binary from the [Kuneifrom Release Repo](https://github.com/kwilteam/kuneiform/releases), instantiate the binary, and calls the .parseKuneiform method. Please note the size of the WASM binary (~10 mb) and account for how that may affect your application.

## Installation

```bash
npm i kuneiform-parser
```

## Initialization

The parser has a slightly different initialization depending on NodeJs or Browser.

#### Configuration Options

Within the `.load()` method in both the `WebParser` and `NodeParser` classes, you can pass an optional configuration option. ***If using `WebParser`, you should pass a [CORS proxy](https://medium.com/nodejsmadeeasy/a-simple-cors-proxy-for-javascript-applications-9b36a8d39c51), otherwise your browser will block the [WASM Download](https://github.com/kwilteam/kuneiform/releases).***

```typescript
const nodeConfig: NodeConfig = {
    cacheTtl?: number, // optional number of seconds for the WASM file to be cached. Default is 1 day.
    logger?: (msg: string) => void // optional a logging function to capture all logs
}

const webConfig: WebConfig = {
    corsProxyUrl: string // URL for CORS proxy
    cacheTtl?: number, // same as node
    logger?: (msg: string) => void // same as node
}

```

### Web - Initialize

```typescript
import { WebParser, WebConfig} from 'kuneiform-parser';

const config: WebParserConfig = {
    corsProxyUrl: 'https://cors-anywhere.herokuapp.com/'
};

async function parse() {
    const parser = await WebParser.load(config);
}
```

### NodeJS - Initialize

```typescript
import { NodeParser } from 'kuneiform-parser';


async function loadParser() {
    const parser = await NodeParser.load(config);
}
```

## Parsing

Once the parser has loaded, you can call `.parse()` to parse your raw Kuneiform to JSON.

```typescript
import { NodeParser, ParseRes } from 'kuneiform-parser';
import kuneiform from 'some_kf_file.kf';

async function loadParser() {
    /* previous code */
    const res = await parser.parse<ParseRes>(kuneiform)

    /*
        res = {
            json: Stringified<KuneiformObject>
        }
    */
}

```

And that is it! The `json` property that is returned can be passed to the [KwilJS DBBuilder Payload](https://docs.kwil.com/docs/sdks/js-ts/apis#payload) to create a database on the Kwil Network.

## Other Resources

* Kwil JS: https://www.npmjs.com/package/kwil
* Kwil Docs: https://docs.kwil.com/
* Kuneiform IDE: https://ide.kwil.com/

## License

MIT License

## Help / Feedback

Any questions and or feedback is welcomed in the [Kwil Discord](https://discord.com/invite/HzRPZ59Kay) or to luke@kwil.com.