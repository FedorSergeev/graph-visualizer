const path = require('path')
const fs = require('fs')
const w3viewBuilder = require('w3view/builder/builder.js')

try {
  fs.mkdirSync(path.resolve(__dirname, './tmp'))
} catch (e) { }

w3viewBuilder(path.resolve(__dirname, './src/web/w3v/screen.w3v.html'), 'screenw3v', (built) => {
  fs.writeFileSync(path.resolve(__dirname, './tmp/screen.w3v.js'), 'export default ' + built)
  console.log('screen.w3v.js built')
})

const copyFiles = [
  'css/style.css',
  'index.html'
]


try {
  fs.mkdirSync(path.resolve(__dirname, './dist/web/css'), { recursive: true })
} catch (e) { }
copyFiles.forEach((fname) => {
  fs.copyFileSync(path.resolve(__dirname, 'src/web', fname), path.resolve(__dirname, 'dist/web', fname))
  console.log(fname, 'copyed')
})


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