
/**
 * 
 * @param {FlowSchema} flowSchema [FlowSchema](../../lib/FlowSchema.d.ts)
 * @returns 
 */
export default function (flowSchema, limits = {}) {

    const counter = {
        totalStates: 0,
        decision: 0,
        external: 0,
        process: 0,
        interactive: 0,
        unused: 0,

        totalJoins: 0,
        badTargets: 0,
        terminators: 0,
        terminatorStates: 0
    }

    const used = {}
    const unused = []

    function scanTree(name) {
        const state = flowSchema.states[name]
        if (!state) {
            counter.badTargets++
            return
        }
        used[name] = true
        counter[state.type]++

        state.connectors?.forEach((connector) => {

            if (connector.name === '#link?') {
                counter.terminatorStates++
            } else {
                counter.totalJoins++
            }

            if (connector.to === flowSchema.terminator) {
                counter.terminators++
            } else if (!used[connector.to]) {
                scanTree(connector.to)
            }
        })
    }

    scanTree(flowSchema.enterState)

    Object.keys((flowSchema.states || {})).forEach(name => {
        if (!used[name]) {
            unused.push(name)
        }
        counter.totalStates++
    })



    return {
        states: [
            { name: 'count', value: counter.totalStates },
            { name: 'unused', value: unused.length },
            { name: 'unusedList', value: unused.length ? '[' + unused.join(', ') + ']' : '' },
            { name: 'decision', value: counter.decision },
            { name: 'process', value: counter.process },
            { name: 'external', value: counter.external },
            { name: 'interactive', value: counter.interactive }

        ],
        joins: [
            { name: 'total', value: counter.totalJoins },
            { name: 'badTargets', value: counter.badTargets },
            { name: 'terminatorStates', value: counter.terminatorStates },
            { name: 'terminators', value: counter.terminators }
        ]
    }


}

