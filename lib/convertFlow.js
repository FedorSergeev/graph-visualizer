const convertFlow = (
    function () {
        /**
         * converts flow definition to graph-schema definition
         * 
         * @param {Document} domDocument 
         * @returns {{
         * apiVerion: string,
        *  enterState: string, 
        *  terminator: string,
        *  description: string,
        *  properties: object,
        *  states: Map<string, {
        *      type: "decision" | "process" | "external",
        *      description: string,
        *      properties: object,
        *      connectors: {name: string, to: string}[]}>
        * }}
        */
        function convertFlow(domDocument) {
            const root = domDocument.documentElement

            const output = {
                apiVerion: '1.0',
                enterState: root.getAttribute('start-state'),
                terminator: 'end',
                description: '',
                properties: {},
                states: {}
            };

            const elements = domDocument.getElementsByTagName('state')

            for (let i = 0; i < elements.length; i++) {
                let item = elements[i]

                let analizer = { type: "", connectors: [], external: {} }
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

            for (let i = 0; i < element.childNodes.length; i++) {
                let item = element.childNodes.item(i)
                if (item.tagName === 'event') {
                    result.type = 'process'
                    continue
                }
                if (item.tagName === 'state-transition') {
                    result.connectors = result.connectors || []
                    result.connectors.push(
                        {
                            name: item.getAttribute('name'),
                            to: item.getAttribute('to')
                        }
                    )
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
                                name: 'return',
                                to: element.getAttribute('name')
                            }
                        ]
                    }
                    result.connectors = result.connectors || []
                    result.connectors.push(
                        {
                            name: item.getAttribute('name'),
                            to: '#' + item.getAttribute('subflow')
                        }
                    )
                }
            }

            if (!result.type) {
                result.type = 'decision'
            }

        }

        try {
            module.exports = convertFlow
        } catch {} 
        return convertFlow

    }
)()
