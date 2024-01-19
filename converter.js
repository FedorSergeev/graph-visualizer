const { DOMParser } = require('@xmldom/xmldom')
const fs = require('fs')
const convertFlow = require('./lib/convertFlow.js')

const parser = new DOMParser()

fs.readFile(process.argv[2], { flag: 'r' },
    (err, buffer) => {
        if (err) {
            console.log('usage')
            console.log('node converter.js path/to/input/file > path/to/output/file')

            throw (err)
        }

        const input = buffer.toString()
        const domDocument = parser.parseFromString(input, 'text/xml')

        console.log(JSON.stringify(convertFlow(domDocument), null, 4))
    }
)



