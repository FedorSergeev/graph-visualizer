
/**
 * @constant {StateShapeConfig}
 */
const defaultConfig = {
    gridSize: 5,
    shapeHeight: 40,
    shapeWidth: 80,
    strokeColor: '#000000',
    bgColor: '#CCCCFF',
    bgColorInteractive: '#CCFFFF',
    textColor: '#000000',
    fontFace: 'sans-serif',
    fontSize: 10
}

/**
 * @constant {Map<string, (stateName: string, stateStructure: StateSchema, config: StateShapeConfig) => DommyStructure>}
 */
const shape = {}

shape.process = shape.interactive = (stateName, stateStructure, config = defaultConfig) => {
    const width = config.shapeWidth
    const height = config.shapeHeight

    const result = {
        width,
        height,

        tag: 'g',
        attributes: {
            transform: 'translate(0 0)'
        },
        children: [
            {
                tag: 'rect',
                attributes: {
                    x: 0,
                    y: 0,
                    width,
                    height,
                    rx: 0.5 * config.gridSize,
                    ry: 0.5 * config.gridSize,
                    fill: stateStructure.type === "interactive" ? config.bgColorInteractive : config.bgColor,
                    stroke: config.strokeColor
                }
            },
            {
                tag: 'text',
                attributes: {
                    x: config.gridSize,
                    y: 3 * config.gridSize,
                    fill: config.textColor,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateName
                ]
            },
            {
                tag: 'text',
                attributes: {
                    x: config.gridSize,
                    y: 5 * config.gridSize,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateStructure.description && '(' + stateStructure.description + ')'
                ]
            }
        ]
    }

    return result
}

shape.decision = (stateName, stateStructure, config = defaultConfig) => {
    const width = config.shapeWidth
    const height = config.shapeHeight

    return {
        width: 16 * config.gridSize,
        height: 8 * config.gridSize,

        tag: 'g',
        attributes: {
            transform: 'translate(0 0)'
        },
        children: [
            {
                tag: 'path',
                attributes: {
                    d: [
                        'M', 0, height / 2,
                        'L', width / 2, 0,
                        'L', width, height / 2,
                        'L', width / 2, height,
                        'z'
                    ].join(' '),
                    fill: config.bgColor,
                    stroke: config.strokeColor
                }
            },
            {
                tag: 'text',
                attributes: {
                    x: 4 * config.gridSize,
                    y: 3 * config.gridSize,
                    fill: config.textColor,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateName
                ]
            },
            {
                tag: 'text',
                attributes: {
                    x: 4 * config.gridSize,
                    y: 5 * config.gridSize,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateStructure.description && '(' + stateStructure.description + ')'
                ]
            }
        ]
    }
}

shape.external = (stateName, stateStructure, config = defaultConfig) => {
    const width = config.shapeWidth
    const height = config.shapeHeight

    return {
        width,
        height,

        tag: 'g',
        attributes: {
            transform: 'translate(0 0)'
        },
        children: [
            {
                tag: 'path',
                attributes: {
                    d: [
                        'M', 0, 0,
                        'L', width - 2 * config.gridSize, 0,
                        'L', width, height / 2,
                        'L', width - 2 * config.gridSize, height,
                        'L', 0, height,
                        'z'
                    ].join(' '),
                    fill: config.bgColor,
                    stroke: config.strokeColor
                }
            },
            {
                tag: 'text',
                attributes: {
                    x: config.gridSize,
                    y: 3 * config.gridSize,
                    fill: config.textColor,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateName
                ]
            },
            {
                tag: 'text',
                attributes: {
                    x: config.gridSize,
                    y: 5 * config.gridSize,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateStructure.description && '(' + stateStructure.description + ')'
                ]
            }
        ]
    }
}

shape.enter = shape.end = (stateName, stateStructure, config = defaultConfig) => {
    const width = 12 * config.gridSize
    const height = 3 * config.gridSize
    const radius = height / 2

    return {
        width,
        height,

        tag: 'g',
        attributes: {
            transform: 'translate(0 0)'
        },
        children: [
            {
                tag: 'path',
                attributes: {
                    d: [
                        'M', radius, 0,
                        'L', width - radius, 0,
                        'A', radius, radius, 0, 0, 1, width - radius, height,
                        'L', radius, height,
                        'A', radius, radius, 0, 0, 1, radius, 0
                    ].join(' '),
                    fill: 'white',
                    stroke: config.strokeColor
                }
            },
            {
                tag: 'text',
                attributes: {
                    x: config.gridSize,
                    y: 2 * config.gridSize,
                    fill: config.textColor,
                    'font-size': config.fontSize,
                    'font-family': config.fontFace
                },
                children: [
                    stateName
                ]
            }
        ]
    }
}

/**
 * @class
 * shape structure generator class constructor
 * @implements StateShape
 * @param {string} stateName 
 * @param {StateSchema} stateStructure 
 * @param {StateShapeConfig} [config=defaultConfig] 
 */
export default function StateShape(stateName, stateStructure, config = defaultConfig) {

    const conf = {}
    Object.keys(defaultConfig).forEach(k => {
        conf[k] = (config[k] + '' && config[k]) || defaultConfig[k]
    })
    const position = [0, 0]

    /**
     * @method 
     * @returns {Map<string, (string, StateSchema, StateShapeConfig)=>DommyStructure>}
     */
    this.getShapes = () => shape

    /**
     * @method
     * Move shape to x,y coordinates
     * 
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @returns {StateShape}
     */
    this.position = (x, y) => {
        position[0] = x
        position[1] = y

        return this
    }

    /**
     * @method 
     * Create state shape structure
     * @returns {DommyStructure} state shape structure, moved to position
     */
    this.render = () => {
        if (!stateStructure) {
            return
        }
        const struct = (shape[stateStructure.type])(stateName, stateStructure, conf)

        struct.attributes.id = 'state-' + stateStructure.type + '/' + stateName

        struct.attributes.transform = 'translate(' + position.join(' ') + ')'

        struct.x = position[0]
        struct.y = position[1]

        return struct
    }

}

