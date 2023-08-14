import { Logger, configDefaults } from '../common/config';
import { Nillable } from './types';

export namespace WasmCache {
    /**
     * Create a new TTL cache that proactively checks for expired items at regular intervals (defined by cleanupIntervalSeconds).
        * @param ttlSeconds - Time to live for each cache entry in seconds. If none is specified, it defaults to 10 minutes.
        * @param cleanupIntervalSeconds - Interval in seconds between each cleanup run. If not set, it defaults to 60 seconds. If set to -1, the cache will run in passive mode and only check for expired items when get() is called.
        * @returns WasmCache
    */
    export function active<T>(ttlSeconds: number = 10 * 60, cleanupIntervalSeconds: number = 60, logger?: Logger): WasmCache {
        return new TtlCache(ttlSeconds, cleanupIntervalSeconds, logger);
    }

    /** 
     * Create a new TTL cache that only checks for expired items when get() is called.
     * @param ttlSeconds - Time to live for each cache entry in seconds. If none is specified, it defaults to 10 minutes.
     * @returns WasmCache
    */
    export function passive(ttlSeconds: number = 10 * 60, logger?: Logger): WasmCache {
        return new TtlCache(ttlSeconds, -1, logger);
    }
}

export interface WasmCache {
    get(k: string, url: string): Nillable<Uint8Array>;
    set(k: string, v: Uint8Array, url: string): void;
    shutdown(): void;
}

export interface CacheEntry{
    d: number;
    v: Nillable<Uint8Array>;
    url: string;
}

class TtlCache<T> {
    private readonly cache: Map<string, CacheEntry>;
    private readonly ttl: number;
    private readonly cleanupIntervalSeconds: number;
    private readonly cleanupQueue: { d: number, k: string }[];
    private cleanupTimerId: any;
    private logger: Logger;

    constructor(ttlSeconds: number, cleanupIntervalSeconds: number, logger: Logger = configDefaults.logger) {
        this.cache = new Map<string, CacheEntry>();
        this.ttl = ttlSeconds * 1000;
        this.cleanupIntervalSeconds = cleanupIntervalSeconds;
        this.cleanupQueue = [];
        this.logger = logger;

        this.logger(`Cache TTL set to ${this.ttl} milliseconds.`)
        if (!this.isPassiveMode()) {
            this.logger(`Cache cleanup interval set to ${cleanupIntervalSeconds} seconds.`)
        } else {
            this.logger(`Cache cleanup running in passive mode.`)
        }
    }

    /**
     * Set a value in the cache
     * @param k - Key for the cache entry.
     * @param v - Value to be stored.
     */
    public set(k: string, v: Uint8Array, url: string): void {
        this.ensureCleanRunning();
        const d = Date.now() + this.ttl;

        const entry: CacheEntry = {
            d,
            v,
            url
        }
        this.cache.set(k, entry);
        if (!this.isPassiveMode()) {
            this.cleanupQueue.push({ d, k });
        }
    }

    /**
     * Get a value from the cache. If the value is not found or has expired, null is returned.
     * @param k - Key for the cache entry.
     * @param v - Value to be stored.
    */
    public get(k: string, u: string): Nillable<Uint8Array> {
        const entry = this.cache.get(k);

        // If the entry is expired, remove it from the cache and return null.
        if (entry && entry.d < Date.now()) {
            this.cache.delete(k);
            return null;
        }

        // If the entry url is different, remove it from the cache and return null.
        if(entry && entry.url !== u){
            this.cache.delete(k);
            return null;
        }

        return entry?.v || null;
    }

    /**
     * This will shutdown the cache cleanup timer.
     * @returns void
    */
    public shutdown(): void {
        if (this.cleanupTimerId) {
            clearInterval(this.cleanupTimerId);
        }
    }

    /**
     * Ensures that the background cleanup is running and the timer is set.
     * @returns void
     * @private
     */
    private ensureCleanRunning(): void {
        if (this.isPassiveMode()) {
            return;
        }

        if (!this.cleanupTimerId) {
            this.cleanupTimerId =
                setInterval(
                    this.cleanup.bind(this),
                    this.cleanupIntervalSeconds * 1000
                );

            this.logger(`Background cache cleanup started. Interval of ${this.cleanupIntervalSeconds} seconds between cleaup.`)
        }
    }

    /**
     * Checks if the cache is running in passive mode.
     * @returns boolean
     * @private
     */
    private isPassiveMode(): boolean {
        return this.cleanupIntervalSeconds <= 0;
    }

    /**
     * Cleanup the cache. This will remove all expired entries from the cache.
     * @returns void
     * @private
    */
    private cleanup(): void {
        let removed = 0;
        while (this.cleanupQueue.length > 0) {
            const entry = this.cleanupQueue[0];
            if (entry.d > Date.now()) {
                break;
            }

            const cacheEntry = this.cache.get(entry.k);
            if (cacheEntry && cacheEntry.d < Date.now()) {
                this.cache.delete(entry.k);
                removed++;
            }

            this.cleanupQueue.shift();
        }

        this.logger(`Running background cache cleanup. Removed ${removed} entries.`)
    }
}