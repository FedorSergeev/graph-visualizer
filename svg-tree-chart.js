const fs = require('fs')
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')
const convertFlow = require('./lib/convertFlow.js')
const SvgTreeChart = require('./lib/flowChart/svgTreeChart.js')

const parser = new DOMParser()

if (process.argv.length < 3) {
    console.log('usage')
    console.log('node converter.js path/to/input/file')
    console.log('node converter.js path/to/input/file path/to/output/file')
    return
}

fs.readFile(process.argv[2], { flag: 'r' },
    (err, buffer) => {
        if (err) {
            throw (err)
        }

        const input = buffer.toString()

        const domDocument = parser.parseFromString(input, 'text/xml')

        const definition = convertFlow(domDocument)

        const svgDom = new SvgTreeChart(definition, domDocument)
            .draw()

        const serialized = new XMLSerializer().serializeToString(svgDom)

        fs.writeFileSync(process.argv[3] || (process.argv[2] + '.svg'), serialized)
    }
)



