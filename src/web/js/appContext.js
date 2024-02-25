import convertFlow from "../../lib/convertFlow.mjs";
import analyzer from "../../lib/flowSchemaAnalyzer.js";
import renderFlowOnCirle from "../../lib/imgFlowChart/imgCircleChart.mjs";
import renderFlowAsSequence from "../../lib/imgFlowChart/imgSequenceChart.mjs";
import SvgTreeChart from "../../lib/svgFlowChart/svgTreeChart.mjs";

// region парочка глобальных переменных а ля конфиг (c) Федя :)
const canvasDimensions = { width: 1300, height: 1300 };
// endregion

/**
 * Подготовка канвы для рисования
 * возвращать как ноду DOM
 * 
 * @returns {HTMLCanvasElement} канва для рисования
 */
function prepare2DCanvas() {
    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    return canvasDocElement;
}

export default {
    target: document.body,
    buttons: [
        {
            title: 'circle chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                const flowSchema = convertFlow(xmlDoc)
                renderFlowOnCirle(flowSchema, canvas)
                canvas.report = analyzer(flowSchema)
                return canvas
            }
        },
        {
            title: 'flow chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                const flowSchema = convertFlow(xmlDoc)
                renderFlowAsSequence(flowSchema, canvas)
                canvas.report = analyzer(flowSchema)
                return canvas
            }
        },
        {
            title: 'tree chart (svg)',
            action: (xmlDoc) => {
                const flowSchema = convertFlow(xmlDoc)
                const svg = new SvgTreeChart(flowSchema, document).draw()
                svg.report = analyzer(flowSchema)
                return svg
            }
        }
    ]
}

