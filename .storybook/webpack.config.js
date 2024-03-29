const path = require('path')

module.exports = async ({ config }) => {

  config.resolve.alias['@'] = path.resolve(__dirname, '../src')
  config.resolve.alias['mock'] = path.resolve(__dirname, '../mock')
  config.resolve.alias['.storybook'] = path.resolve(__dirname, './')

  return config
}