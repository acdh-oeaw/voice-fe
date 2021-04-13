const { IncomingMessage } = require('http')
const https = require('https')
const sax = require('sax')

const localFunctions = {
    getImprintHTML: async function(id, addClasses) {
        const data = await httpGet(`https://shared.acdh.oeaw.ac.at/acdh-common-assets/api/imprint.php?serviceID=${id}`, (rawData, onlyAttr, val, onlyTopTag) => {processResult(rawData, onlyAttr, val, onlyTopTag, addClasses)})
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
      resolve(processResult(rawData, 'lang', 'en', 'div'));
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

function processResult(rawData, onlyAttr, val, onlyTopTag, addClasses) {
  const parser = sax.parser(false, {lowercase: true})
  let res = ''
  let tagname = []
  let ignore = false
  let isSelfClosing = false
  parser.onerror = function (e) {
    throw new Error(e)
  };
  parser.ontext = function (t) {
    if (ignore) {return}
    res += t
  };
  parser.onopentag = function (node) {
    isSelfClosing = node.isSelfClosing
    ignore = (node.attributes[onlyAttr] && node.attributes[onlyAttr] !== val) ||
             (tagname.length === 1 && node.name !== onlyTopTag) ? `${node.name}_${tagname.length}` : ignore
    tagname.push(node.name)
    if (ignore || node.name === '____') {return}
    if (isSelfClosing) {
      res += `<${node.name}${serializeAttr(node.attributes)}/>`
    } else if (tagname.length === 1) {
      if (node.attributes.class) {
        res += `<${node.name}${serializeAttr(node.attributes, addClasses)}>`
      } else {
        res += `<${node.name}${serializeAttr(node.attributes)} class="${addClasses}">`
      }
    } else {
      res += `<${node.name}${serializeAttr(node.attributes)}>`
    }
  };
  parser.onclosetag = function () {
    const nodeName = tagname.pop(),
          endIgnore = ignore || isSelfClosing
    ignore = ignore === `${nodeName}_${tagname.length}` ? false : ignore
    isSelfClosing = false
    if (endIgnore || nodeName === '____') {return}
    res += `</${nodeName}>`
  };
  
  parser.write(`<____>${rawData}</____>`).close()
  return res
}

function serializeAttr(attributes, addClasses) {
  let res = ''
  for (let attr of Object.keys(attributes)) {
    if (attr == 'class' && addClasses) {
      res += ` ${attr}="${attributes[attr]} ${addClasses}"`
    } else {
      res += ` ${attr}="${attributes[attr]}"`
    }
  }
  return res
}

module.exports = localFunctions.getImprintHTML