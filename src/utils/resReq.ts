import { KuneiformObject } from "./types";

type Stringified<T> = string;

export interface ParseRes {
    json: Stringified<KuneiformObject>;
}