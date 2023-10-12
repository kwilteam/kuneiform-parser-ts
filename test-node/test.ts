import { NodeParser, WebConfig } from "../dist";
import fs from 'fs';
import path from 'path';

const tsKf = fs.readFileSync(path.join(__dirname, '../test.kf'), 'utf8');

async function parse(kfCode: string) {    
    const parser = await NodeParser.load();
    const res = await parser.parse(kfCode);
    if(!res.json) {
        console.log(res.error);
        throw new Error('Parse error');
    }

    console.log(res.json);
}

parse(tsKf);