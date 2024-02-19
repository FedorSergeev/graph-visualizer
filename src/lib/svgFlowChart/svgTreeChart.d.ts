
interface StateShapeConfig {
    gridSize?: number;
    shapeHeight?: number;
    shapeWidth?: number;
    strokeColor?: string;
    bgColor?: string;
    bgColorInteractive?: string,
    textColor?: string;
    fontFace?: string;
    fontSize?: number;
}

interface StateShape {
    constructor: (stateName: string, stateStructure: StateSchema, config: StateShapeConfig) => void;
    getShapes: () => Map<string, StateShape>;
    position: (x: number, y: number) => StateShape;
    draw: () => DommyStructure;
}

interface SvgTreeChartConfig extends StateShapeConfig {
    rowHeight?: number;
    columnWidth?: number;
    turnRadius?: number;
    marginLeft?: number;
    marginTop?: number;
    textBoxLength?: number;
}

interface SvgTreeChart {
    constructor: (flowModel: FlowSchema, document: Document, config: SvgTreeChartConfig) => void;
    draw: () => Node
}