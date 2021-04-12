const GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = {
  'pages': {
    'index': 'src/main.js',
    'imprint': 'src/imprint/main.js'
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
  },
  "transpileDependencies": [
    "vuetify"
  ]
}