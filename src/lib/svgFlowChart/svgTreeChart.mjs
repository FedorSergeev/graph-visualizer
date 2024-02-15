import dommy from '../dommy.mjs'
import StateShape from './shapes.mjs'

const defaultConfig = {
    rowHeight: 60,
    columnWidth: 80,
    turnRadius: 15,
    marginLeft: 10,
    marginTop: 10,
    textBoxLength: 15,

    gridSize: 5,
    shapeHeight: 40,
    shapeWidth: 80,
    strokeColor: '#000000',
    bgColor: '#CCCCFF',
    textColor: '#000000',
    fontFace: 'sans-serif',
    fontSize: 10
}

/**
 * SvgTreeChart constructor 
 * @param {FlowSchema} flowModel 
 * @param {Document} document 
 * @param {SvgTreeChartConfig} config 
 */
export default function SvgTreeChart(flowModel, document, config = defaultConfig) {
    const NS = 'http://www.w3.org/2000/svg'

    const conf = {}
    Object.keys(defaultConfig).forEach(k => {
        conf[k] = (config[k] + '' && config[k]) || defaultConfig[k]
    })

    const content = {
        tag: 'g',
        attributes: {
            transform: 'translate(0 0)'
        },
        children: []
    }

    const root = {
        tag: 'svg',
        attributes: {
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg"
        },
        children: [
            content
        ]
    }

    const rowIndex = []
    const drawnShapes = {}


    /**
     * @method
     * Draw SvgTreeChart as SVG DOM Node
     */
    this.draw = function () {
        //start
        const startPoint = new StateShape('start', { type: 'enter' }, conf)
            .position(conf.marginLeft, conf.marginTop)
            .render()

        startPoint.joins = calcJoins(startPoint)

        content.children.push(startPoint)
        // drawnShapes.$start = startPoint

        //tree
        drawState(startPoint, flowModel.enterState, 1, 1)

        const numColumns = (rowIndex.filter(el => el).map((el) => el.deep).sort((a, b) => b - a)[0] + 1) || 0

        root.attributes.height = (rowIndex.length) * conf.rowHeight
        root.attributes.width = numColumns * conf.columnWidth + 2 * conf.marginLeft

        return dommy(root, document, NS)
    }

    function drawState(parentState, stateName, row, column, connectorName) {
        let state = flowModel.states[stateName]
        let terminator = false
        if (!state) {
            if (stateName !== flowModel.terminator) {
                console.warn('State [' + stateName + '] not found')
                return
            }
            state = { type: 'end' }
            terminator = true
        }

        const draw = new StateShape(stateName, state, conf)
            .position(column * conf.columnWidth, row * conf.rowHeight)
            .render()

        draw.joins = calcJoins(draw)

        content.children.push(draw)
        !terminator && (drawnShapes[stateName] = draw)

        rowIndex[row] = draw
        draw.deep = column
        draw.column = column
        draw.row = row

        content.children.push(drawConnector(parentState, draw, connectorName))

        state.connectors?.forEach((el) => {
            let to = el.to
            if (drawnShapes[to]) {
                content.children.push(drawConnector(draw, drawnShapes[to], el.name))
                return;
            }
            drawState(draw, to, rowIndex.length, column + 1, el.name)
        })

    }

    function calcJoins(state) {
        const x = state.x
        const y = state.y
        const w = state.width
        const h = state.height

        return {
            left: { x: x, y: y + h / 2 },
            bottom: { x: x + w / 2, y: y + h },
            right: { x: x + w, y: y + h / 2 },
            top: { x: x + w / 2, y: y }
        }
    }

    function drawConnector(fromState, toState, name) {
        if (fromState.x < toState.x && fromState.y < toState.y) {
            return drawFC(fromState, toState, name)
        }
        return drawBC(fromState, toState, name)
    }

    function drawFC(fromState, toState, name) {
        const from = fromState.joins.bottom
        const to = toState.joins.left
        const gridSize = conf.gridSize
        const turnRadius = conf.turnRadius

        let tx = 0, ty = toState.row * conf.rowHeight

        return {
            tag: 'g',
            attributes: {
                id: 'connector-forward/'+name
            },
            children: [
                {
                    tag: 'path',
                    attributes: {
                        d: [
                            'M', from.x, from.y,
                            'L', tx = from.x, to.y - turnRadius,
                            'A', turnRadius, turnRadius, 0, 0, 0, from.x + turnRadius, to.y,
                            'L', to.x, to.y
                        ].join(' '),
                        fill: 'none',
                        stroke: conf.strokeColor
                    }
                },
                {
                    tag: 'path',
                    attributes: {
                        d: [
                            'M', to.x, to.y,
                            'L', to.x - 2 * gridSize, to.y - gridSize,
                            'L', to.x - 2 * gridSize, to.y + gridSize,
                            'Z'
                        ].join(' ')
                    },
                    fill: conf.strokeColor,
                    stroke: conf.strokeColor
                },
                textBox(name, 1, tx + conf.gridSize, ty - conf.gridSize)
            ]
        }
    }

    function drawBC(fromState, toState, name) {
        const from = fromState.joins.top
        const to = toState.joins.right
        const gridSize = conf.gridSize
        const turnRadius = conf.turnRadius
        const columnWidth = conf.columnWidth

        let deep = (toState.column > fromState.column ? toState.column: fromState.column) + 1
        let intervals = []

        for (let i = toState.row+1; i < fromState.row; i++) {
            if (rowIndex[i].deep >= fromState.deep) {
                fromState.deep = rowIndex[i].deep + 1
            }
            if(rowIndex[i].deep >= deep) {
                deep = rowIndex[i].deep + 1
            }
        }

        let px = 0, py = 0
        let tx = 0, ty = 0

        return {
            tag: 'g',
            attributes: {
                id: 'connector-backward/'+name
            },
            children: [
                {
                    tag: 'path',
                    attributes: {
                        d: [
                            'M', px = from.x, py = from.y,
                            'A', turnRadius, turnRadius / 2, 0, 0, 1, px = px + turnRadius, py = py - turnRadius / 2,
                            'L', px = deep * columnWidth, py,
                            'A', turnRadius, turnRadius, 0, 0, 0, px = px + turnRadius, py = py - turnRadius,
                            'L', tx = px, ty = py = to.y + turnRadius,
                            'A', turnRadius, turnRadius, 0, 0, 0, px = px - turnRadius, to.y,
                            'L', to.x, to.y
                        ].join(' '),
                        fill: 'none',
                        stroke: conf.strokeColor
                    }
                },
                {
                    tag: 'path',
                    attributes: {
                        d: [
                            'M', to.x, to.y,
                            'L', to.x + 2 * gridSize, to.y - gridSize,
                            'L', to.x + 2 * gridSize, to.y + gridSize,
                            'z'
                        ].join(' '),
                        fill: conf.strokeColor,
                        stroke: conf.strokeColor
                    }
                },
                textBox(name, 1, tx + conf.gridSize, ty)
            ]
        }
    }

    function textBox(text = '', width = 1, x = 0, y = 0) {
        const words = text.split(/\s/)
        const lines = []

        let line = ''

        words.forEach((word) => {
            if (!line) {
                line = word
            } else {
                line = line + ' ' + word
            }

            if (line.length >= width) {
                let item 
                lines.push(item = 
                    {
                        tag: 'tspan',
                        attributes: {
                            x: x,
                            dy: conf.fontSize
                        },
                        children: [
                            line
                        ]
                    }
                )
                conf.textBoxLength < line.length &&
                (item.attributes['font-size'] = conf.fontSize * conf.textBoxLength / line.length),

                line = ''
            }
        })

        return {
            tag: 'text',
            attributes: {
                x: x,
                y: y - conf.fontSize * lines.length,
                'font-size': conf.fontSize,
                'font-family': conf.fontFace
            },
            children: lines
        }
    }
}
