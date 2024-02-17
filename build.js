const fs = require('fs')
const w3viewBuilder = require('w3view/builder/builder.js')
const path = require('path')
const webpack = require('webpack')
const wpconf = require(path.resolve(__dirname, 'webpack.config.js'))


const TMP_DIR = './src/web/js/tmp'

console.time('total time')

const copyFiles = [
    ['css/style.css', 'css/style.css'],
    ['index.m.html',  'index.html']
]

try {
    fs.mkdirSync(path.resolve(__dirname, TMP_DIR), { recursive: true })
    fs.rmSync(path.resolve(__dirname, './dist'), { recursive: true })
} catch (e) { }

w3viewBuilder(
    path.resolve(__dirname, './src/web/w3v/screen.w3v.html'),
    'w3v',
    (built) => {
        fs.writeFileSync(path.resolve(__dirname, TMP_DIR, 'screen.w3v.js'),
            'import W3View from \'w3view\' \n\nexport default ' + built)

        console.log('screen.w3v.js built')
        console.log('build modules')

        webpack(wpconf, (err) => {
            if (err) {
                console.error(err)
                return
            }

            fs.rmSync(path.resolve(__dirname, TMP_DIR), { recursive: true })

            copyFiles.forEach((fname) => {
                try {
                    console.log(path.resolve(__dirname, 'dist/web', path.dirname(fname[1])))
                    fs.mkdirSync(path.resolve(__dirname, 'dist/web', path.dirname(fname[1])), { recursive: true })
                } catch (e) { }
                fs.copyFileSync(path.resolve(__dirname, 'src/web', fname[0]), path.resolve(__dirname, 'dist/web', fname[1]))
                console.log(fname[0], 'copyed')
            })

            console.info('build success')
            console.timeEnd('total time')
        })
    }
)


