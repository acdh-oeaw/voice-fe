const { IncomingMessage } = require('http')
const https = require('https')
const sax = require('sax')

const localFunctions = {
    getImprintHTML: async function(id, addClasses) {
        const data = await httpGet(`https://imprint.acdh.oeaw.ac.at/${id}/?fromat=html`, (rawData, onlyAttr, val, onlyTopTag) => {processResult(rawData, onlyAttr, val, onlyTopTag, addClasses)})
        return data
    }
}

function httpGet(url) {
return new Promise ((resolve, reject) => {
    https.get(url, (res) => {
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  // Any 2xx status code signals a successful response but
  // here we're only checking for 200.
  if (statusCode !== 200) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
  } else if (!/^text\/html/.test(contentType)) {
    error = new Error('Invalid content-type.\n' +
                      `Expected text/html but received ${contentType}`);
  }
  if (error) {
    console.error(error.message);
    // Consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
      resolve(rawData);
    } catch (e) {
      console.error(e.message);
      reject(e)
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
  reject(e)
});
})
}

module.exports = localFunctions.getImprintHTML