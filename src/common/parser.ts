import axios from 'axios';
import { WasmCache } from '../utils/cache.js';

const wasmURL = 'https://github.com/KwilLuke/kf-v0.4.1/raw/main/kuneiform.wasm';

// Polyfill up crypto.getRandomValues() for globalThis object
if (typeof globalThis.crypto === 'undefined') {
    const crypto = require('crypto');
    globalThis.crypto = {
        getRandomValues: function (buffer: any) {
            return crypto.randomFillSync(buffer);
        }
    } as Crypto;
}

import '../wasm/wasm_exec.js';
import { Nillable, ParseKf } from '../utils/types.js';
import { Logger, NodeConfig, configDefaults, WebConfig } from './config.js';
import { ParseRes } from '../utils/resReq.js';

export class Parser<T> {
    private cacheKey: string = 'kfCurrent';
    private logger: Logger = configDefaults.logger;
    private readonly wasmUrl: string = wasmURL;
    private proxyUrl: string = '';
    private WasmCache?: WasmCache;
    private parseKf?: ParseKf;

    public static async load<U extends NodeConfig | WebConfig>(config?: U): Promise<Parser<U>> {
        const parser: Parser<U> = new this();

        // Set logger, if provided
        if(config && config.logger) {
            parser.logger = config.logger;
        }

        // Set proxyUrl, if provided
        if(config) {
            if ('corsProxyUrl' in config) {
                if(config.corsProxyUrl) {
                    parser.proxyUrl = config.corsProxyUrl;
                }
            }
        }
        
        // Set cacheTtl, if provided. If not, create default cacheTtl    
        parser.WasmCache = WasmCache.passive(config && config.cacheTtl ? config.cacheTtl : configDefaults.cacheTtl, parser.logger);
       
        // Download and initialize WASM module
        await parser.init();
        return parser;
    }

    constructor() {}

    private async init(): Promise<void> {
        const go = new (globalThis as any).Go();
        
        const typedArray = await this.getWasmBinary();
        const result: WebAssembly.WebAssemblyInstantiatedSource = await WebAssembly.instantiate(typedArray, go.importObject);
        go.run(result.instance)
        const { parseKuneiform } = globalThis as any;
        this.parseKf = parseKuneiform as ParseKf;
    }

    async parse(kfCode: string): Promise<ParseRes> {
        if(!this.WasmCache || !this.parseKf) {
            throw new Error('WasmCache not initialized. Please call `await Parser.load()` first.');
        }

        const module = this.WasmCache.get(this.cacheKey, this.wasmUrl);

        if (!module) {
            this.logger('WASM binary is out of date. Reloading...');
            await this.init();
        }

        return this.parseKf(kfCode);
    }

    private async getWasmBinary(): Promise<Uint8Array> {
        if (!this.WasmCache) {
            throw new Error('WasmCache not initialized. Please call `await Parser.load()` first.');
        }

        this.logger(`Requesting WASM module from ${this.proxyUrl + this.wasmUrl}...`)
        const response = await axios.get(this.proxyUrl + this.wasmUrl, { responseType: 'arraybuffer' });
        const wasmBuffer = Buffer.from(response.data);
        const typedArray = new Uint8Array(wasmBuffer);
        this.WasmCache.set(this.cacheKey, typedArray, this.wasmUrl);
        return typedArray;
    }    
}