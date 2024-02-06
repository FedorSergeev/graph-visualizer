        const TERMINATOR = 'end'
        
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
                    output.states[key] || (output.states[key] = analizer.external[key])
                })

            }

            return output;
        }

        function analize(element, result) {

            const connectorsIndex = {}
            const connectors = []

            for (let i = 0; i < element.childNodes.length; i++) {
                let item = element.childNodes.item(i)
                if (item.tagName === 'event') {
                    result.type = 'process'
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
                    result.external['#' + item.getAttribute('subflow')] = {
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
                            to: '#' + item.getAttribute('subflow')
                        }
                    )
                }
            }

            connectors.length <= 1 && result.type === 'decision' && (result.type = 'process')

            !connectors.length && addConnector(
                {
                    name: '#link?',
                    to: TERMINATOR
                }
            )

            connectors.forEach((item) => result.connectors.push(item))

            function addConnector(entry) {
                if (connectorsIndex[entry.to]) {
                    connectorsIndex[entry.to].name += ', ' + entry.name
                } else {
                    connectorsIndex[entry.to] = entry
                    connectors.push(entry)
                }
            }

        }
