const {GitRevisionPlugin} = require('git-revision-webpack-plugin')
const webpack = require('webpack')
const fs = require('fs')

module.exports = {
  'pages': {
    'index': 'src/main.js',
    'imprint': 'src/imprint/main.js',
    'dependency-license-report': 'src/dependency-license-report/main.js'
  },
  'chainWebpack': config => {
    config.plugin('define').tap(args => {
      const gitRevisionPlugin = new GitRevisionPlugin({
        lightweightTags: true
      })
      args[0]['process.env']['VUE_APP_VERSION'] = JSON.stringify(gitRevisionPlugin.version())
      args[0]['process.env']['VUE_APP_COMMIT_HASH'] = JSON.stringify(gitRevisionPlugin.commithash())
      args[0]['process.env']['VUE_APP_BRANCH'] = JSON.stringify(gitRevisionPlugin.branch())
      return args
    })
    const license = fs.readFileSync('LICENSE', 'utf8')
    config.plugin('banner').use(webpack.BannerPlugin, [`
@source https://github.com/acdh-oeaw/voice-fe

@licstart The following is the entire license notice for the JavaScript code in this file
${license}
@licend The above is the entire license notice for the JavaScript code in this file
  `])
    config.devtool('nosources-source-map')
  },
  "transpileDependencies": [
    "vuetify"
  ]
}