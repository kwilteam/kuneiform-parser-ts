import { NodeParser, Logger, NodeConfig } from "../dist";
const fs = require('fs');
const path = require('path');
const testKf = fs.readFileSync(path.join(__dirname, '../test.kf'), 'utf-8');

describe('NodeParser', () => {

    afterEach(() => {
        jest.resetAllMocks();
    })

    describe('load without config', () => {
        let parser: NodeParser;

        it('should return a NodeParser instance', async () => {
            parser = await NodeParser.load();
            expect(parser).toBeInstanceOf(NodeParser);
            expect((parser as any).parseKf).toBeDefined();
            expect((parser as any).WasmCache).toBeDefined();
        }, 10000);

        it('should have a cached wasm module', () => {
            const cacheKey = (parser as any).cacheKey;
            const wasmCache = (parser as any).WasmCache;
            const wasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
            expect(wasmModule).toBeDefined();
        });

        it('should have a default logger', () => {
            const logger = (parser as any).logger;
            expect(logger).toBeDefined();
        });

        it('should have a parseKf function', () => {
            const parseKf = (parser as any).parseKf;
            expect(parseKf).toBeDefined();
        });

        describe('parse', () => {
            it('should parse kuneiform code', async () => {
                const result = await parser.parse(testKf.toString());
                expect(result).toBeDefined();
                expect(result).toBeInstanceOf(Object);
                expect(JSON.parse(result.json)).toHaveProperty('name');
            });

            it('should parse again with the cached wasm module', async () => {
                const wasmCache = (parser as any).WasmCache;
                const cacheKey = (parser as any).cacheKey;

                const wasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
                expect(wasmModule).toBeDefined();

                const result = await parser.parse(testKf.toString());
                expect(result).toBeDefined()
            });

            it('should have to request a new wasm module if cache expired', async () => {
                const wasmCache = (parser as any).WasmCache;
                const cacheKey = (parser as any).cacheKey;

                const mockedDateNow = Date.now() + 1000 * 60 * 60 * 24 + 100; // 1 day and 100 milliseconds ahead of the current time
                global.Date.now = jest.fn(() => mockedDateNow);

                const wasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
                expect(wasmModule).toBeNull();

                const result = await parser.parse(testKf.toString());
                const newWasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
                expect(newWasmModule).toBeDefined();
                expect(result).toBeDefined();

                jest.resetAllMocks();
            }, 10000);
        });
    });

    describe('load with config', () => {
        const customLogger: Logger = (msg: string) => { return msg };

        let config: NodeConfig = {
            cacheTtl: 5,
        };

        let parser: NodeParser;

        it('should return a NodeParser instance', async () => {
            parser = await NodeParser.load(config);
            expect(parser).toBeInstanceOf(NodeParser);
            expect((parser as any).logger).toBeDefined();
            expect((parser as any).WasmCache).toBeDefined();
        }, 10000);

        it('should have a parseKf function', () => {
            const parseKf = (parser as any).parseKf;
            expect(parseKf).toBeDefined();
        });

        describe('parse', () => {
            it('should parse kuneiform code', async () => {
                const result = await parser.parse(testKf.toString());
                expect(result).toBeDefined();
                expect(result).toBeInstanceOf(Object);
                expect(JSON.parse(result.json)).toHaveProperty('name');
            });

            it('should have to request a new wasm module if cache expired', async () => {
                const wasmCache = (parser as any).WasmCache;
                const cacheKey = (parser as any).cacheKey;

                const mockedDateNow = Date.now() + 70000 // 70 seconds ahead of the current time
                global.Date.now = jest.fn(() => mockedDateNow);

                console.log('CHECKING FOR DELETION NOW')
                const wasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
                expect(wasmModule).toBeNull();

                const result = await parser.parse(testKf.toString());

                const newWasmModule = wasmCache.get(cacheKey, (parser as any).wasmUrl);
                expect(newWasmModule).toBeDefined();
                expect(result).toBeDefined();

                jest.resetAllMocks();
            }, 10000);
        });
    });
})