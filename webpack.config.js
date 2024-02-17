const path = require('path')

module.exports = [
  {
    mode: 'production',
    name: 'web-js',
    target: 'web',
    entry: './src/web/js/index.mjs',
    output: {
      path: path.resolve(__dirname, './dist/web/js/'),
      filename: 'index.js'
    }
  },
  {
    mode: 'production',
    name: 'cli',
    target: 'node',
    entry: './src/cli/svg-tree-chart.mjs',
    output: {
      path: path.resolve(__dirname, './dist/cli/'),
      filename: 'svg-tree-chart.js'
    }
  }
]