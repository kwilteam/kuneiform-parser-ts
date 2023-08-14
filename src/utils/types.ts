import { ParseRes } from "./resReq";

export type Nil = null | undefined;
export type Nillable<T> = T | Nil;

export type ParseKf = (kfCode: string) => Promise<ParseRes>;

export interface KuneiformObject {
    owner: string;
    name: string;
    tables: Table[];
    actions: Action[];
}

export interface Table {
    name: string;
    columns: Column[];
}

export interface Column {
    name: string;
    type: string;
    attributes: Attribute[];
}

export interface Attribute {
    type: string;
    value?: string;
}

export interface Action {
    name: string;
    public: boolean;
    inputs: string[];
    statements: string[];
}