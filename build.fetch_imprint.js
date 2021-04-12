const fs = require('fs').promises
const getImprintHTML = require('./src/functions/fetchImprint')

const imprintHTML = './public/imprint.html'
const imprintVue = './src/imprint/Imprint.vue'

module.exports = (api, options) => {
    api.registerCommand('build:fetchImprint', async (args) => {
      try {
        var snippet = await getImprintHTML(),
            htmlTemplate = await (await fs.readFile(imprintHTML)).toString('UTF-8'),
            html = htmlTemplate.replace(/\{\{\s*imprint\s*\}\}/g, snippet),
            vueTemplate = await (await fs.readFile(imprintVue)).toString('UTF-8'),
            vue = vueTemplate.replace(/\{\{\s*imprint\s*\}\}/g, snippet)
        await fs.writeFile(imprintHTML, html)
        await fs.writeFile(imprintVue, vue)
    } catch (e) {
        console.log(e)
    }
    })
  }
  
  module.exports.defaultModes = {
    'build:fetchImprint': 'production'
  }