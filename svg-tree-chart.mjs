import { readFile, writeFileSync } from 'fs'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import convertFlow from './lib/convertFlow.mjs'
import SvgTreeChart from './lib/svgFlowChart/svgTreeChart.mjs'

const parser = new DOMParser()

if (process.argv.length < 3) {
    console.log('usage')
    console.log('node converter.js path/to/input/file')
    console.log('node converter.js path/to/input/file path/to/output/file')
} else {

    readFile(process.argv[2], { flag: 'r' },
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

            writeFileSync(process.argv[3] || (process.argv[2] + '.svg'), serialized)
        }
    )
}



