import convertFlow from "../../lib/convertFlow.mjs";
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
    buttons: [
        {
            title: 'circle chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                renderFlowOnCirle(convertFlow(xmlDoc), canvas)
                return canvas
            }
        },
        {
            title: 'flow chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                renderFlowAsSequence(convertFlow(xmlDoc), canvas)
                return canvas
            }
        },
        {
            title: 'tree chart (svg)',
            action: (xmlDoc) => {
                return new SvgTreeChart(convertFlow(xmlDoc), document).draw()
            }
        }
    ]
}

