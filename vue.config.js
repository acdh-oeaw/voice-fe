const GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = {
  'chainWebpack': config => {
    config.plugin('define').tap(args => {
      const gitRevisionPlugin = new GitRevisionPlugin()
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