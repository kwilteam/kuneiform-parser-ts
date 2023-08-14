const { NodeParser } = require('../dist/index');
const fs = require('fs');
const path = require('path');   
const testKf = fs.readFileSync(path.join(__dirname, '../test.kf'), 'utf-8');

const logFilePath = path.join(__dirname, 'app.log');

async function test() {
    const nodeParser = await NodeParser.load({
        cacheTtl: 69,
    });

    const result = await nodeParser.parse(testKf.toString());
    const res2 = await nodeParser.parse(testKf.toString());
    console.log(result);
    console.log(res2);
}

test();

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
  
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }
  
  // Example usage:
  log('This is a test log message.');




