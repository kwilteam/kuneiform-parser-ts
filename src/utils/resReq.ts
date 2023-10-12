import { KuneiformObject } from "./types";

type Stringified<T> = string;

type Success = { json: Stringified<KuneiformObject>; error: never };
type Failure = { json: never; error: string };

export type ParseRes = Success | Failure;
