try {
    var dommy = require('../dommy.js')
} catch {}


/**
 * 
 * @param {*} flowModel 
 * @param {Document} document 
 */
function drawSvgTreeChart(flowModel, document) {

    let definition = {
        tag: 'svg',
        attributes: {
            version: '1.1',
            baseProfile: 'full',
            width: '300', 
            height: '200',
            xmlns: 'http://www.w3.org/2000/svg'
        },
        children: [
            {
                tag: 'g',
                children: [
                    {
                        tag: 'rect'
                    }
                ]
            }
        ]
    }



    return dommy(definition, document)
}