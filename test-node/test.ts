import { NodeParser, WebConfig } from "../dist";

const config: WebConfig = {
    corsProxyUrl: 'https://cors-anywhere.herokuapp.com/'
};

const parser = await NodeParser.load(config)