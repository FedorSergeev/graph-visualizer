
/**
 * creates DOM Node from js structure
 * 
 * @param {DommyStructure | string} structure 
 * @param {Document} document
 * @param {string} ns name space
 * @returns {Node} node
 */
export default function dommy(structure, document, ns) {

    if (!structure) {
        return document.createTextNode('')
    }
    if (typeof structure !== 'object') {
        return document.createTextNode(structure)
    }

    const node = ns && document.createElementNS(ns, structure.tag) ||
        document.createElement(structure.tag)

    Object.keys((structure.attributes || {})).forEach(key => {
        node.setAttribute(key, structure.attributes[key])
    })

    structure.children?.forEach(child => {
        node.appendChild(dommy(child, document, ns))
    })

    return node
}
