
/**
 * creates DOM Node from js structure
 * 
 * @param {{
 *  tag: string,
 *  attributes?: object,
 *  children?: object[]
 * } | string} structure 
 * @param {Document} document
 * @returns {Node} node
 */
function dommy(structure, document){

    if(!structure) {
        return document.createTextNode('')
    }
    if(typeof structure !== 'object') {
        return document.createTextNode(structure)
    }

    const node = document.createElement(structure.tag)

    Object.keys((structure.attributes || {})).forEach(key => {
        node.setAttribute(key, structure.attributes[key])
    })

    
    structure.children?.forEach(child => {
        node.appendChild(dommy(child, document))
    })

    return node
}

try{
    module.exports = dommy
} catch {}