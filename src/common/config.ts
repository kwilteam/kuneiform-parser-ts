export interface NodeConfig {
    cacheTtl?: number;
    logger?: Logger;
}

export interface WebConfig {
    cacheTtl?: number;
    logger?: Logger;
    corsProxyUrl: string;
}

interface ParserConfigDefault {
    cacheTtl: number;
    logger: Logger;
    corsProxyUrl: string;
}

export const configDefaults: ParserConfigDefault = {
    cacheTtl: 60 * 60 * 24, // 1 day
    logger: (msg: string) => console.log(msg),
    corsProxyUrl: ''
};

export type Logger = (msg: string) => void;