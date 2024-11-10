const TERMINATOR = 'end'

const externals = {}

/**
 * converts flow definition to graph-schema definition
 * 
 * @param {Document} domDocument 
 * @returns {FlowSchema}
*/
export default function convertFlow(domDocument) {
    const root = domDocument.documentElement

    const output = {
        apiVerion: '1.0',
        enterState: root.getAttribute('start-state'),
        terminator: TERMINATOR,
        description: '',
        properties: {},
        states: {}
    };

    const elements = domDocument.getElementsByTagName('state')

    for (let i = 0; i < elements.length; i++) {
        let item = elements[i]

        let analizer = { type: 'decision', connectors: [], external: {} }
        analize(item, analizer)

        output.states[item.getAttribute('name')] = {
            type: analizer.type,
            description: item.getAttribute('title'),
            properties: {},
            connectors: analizer.connectors
        }

        Object.keys(analizer.external).forEach(key => {
            if (output.states[key]) {
                analizer.external[key].connectors.forEach((c) => {
                    output.states[key].connectors.push(c)
                })
            } else {
                output.states[key] = analizer.external[key]
            }
        })

    }

    return output;
}

function analize(element, result) {

    const connectorsIndex = {}
    const connectors = []
    const events = []

    for (let i = 0; i < element.childNodes.length; i++) {
        let item = element.childNodes.item(i)
        if (item.tagName === 'event') {
            result.type = 'interactive'
            events.push(item.getAttribute('name'))
            continue
        }
        if (item.tagName === 'state-transition') {
            addConnector({
                name: item.getAttribute('name'),
                to: item.getAttribute('to')
            })
            continue
        }
        if (item.tagName === 'flow-transition') {
            result.external = result.external || {}

            const externalName = item.getAttribute('subflow')

            result.external['#' + externalName] = {
                type: 'external',
                description: '',
                properties: {},
                connectors: [
                    {
                        name: '#return',
                        to: element.getAttribute('name')
                    }
                ]
            }
            addConnector(
                {
                    name: item.getAttribute('name'),
                    to: '#' + externalName
                }
            )
        }
    }

    connectors.length <= 1 && result.type === 'decision' && (result.type = 'process')

    if (result.type === 'interactive') {
        result.external = result.external || {}
        const actorName = '#' + Math.random()
        const actor = result.external[actorName] = {
            type: 'actor',
            description: '',
            properties: {},
            connectors: []
        }
        let eventName;
        events.forEach((event, index) => {
            if (index === 0) {
                actor.connectors.push(
                    {
                        name: eventName = '[' + event + ']',
                        to: element.getAttribute('name')
                    }
                )
                return
            }
            actor.connectors[0].name = eventName += ', [' + event + ']'
        })
        addConnector(
            {
                name: '#actor',
                to: actorName
            },
            true
        )
    }

    !connectors.length && addConnector(
        {
            name: '#link?',
            to: TERMINATOR
        }
    )

    connectors.forEach((item) => result.connectors.push(item))

    function addConnector(entry, asFirst = false) {
        if (connectorsIndex[entry.to]) {
            connectorsIndex[entry.to].name += ', ' + entry.name
        } else {
            connectorsIndex[entry.to] = entry
            if(asFirst) {
                connectors.unshift(entry)
            } else {
                connectors.push(entry)
            }
        }
    }

}
