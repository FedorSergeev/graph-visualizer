import convertFlow from "../../lib/convertFlow.mjs";
import renderFlowOnCirle from "../../lib/imgFlowChart/imgCircleChart.mjs";
import renderFlowAsSequence from "../../lib/imgFlowChart/imgSequenceChart.mjs";
import SvgTreeChart from "../../lib/svgFlowChart/svgTreeChart.mjs";

// region парочка глобальных переменных а ля конфиг
// такие <а ля> нам не нужны, конфиг так конфиг
const canvasDimensions = { width: 1300, height: 1300 };
// endregion

/**
 * Подготовка канваса, зависит от метода отрисовки, 
 * поэтому стоит вынести в отдельную мапу с лямблами для выбора способа рендера
 * или создавать внутри рисовалки и возвращать ка ноду DOM
 * 
 * @returns {CanvasRenderingContext2D} контекст для рисования
 */
function prepare2DCanvas() {
    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    return canvasDocElement;
}

export default {
    ace,
    buttons: [
        {
            title: 'circle chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                renderFlowOnCirle(convertFlow(xmlDoc), canvas)
                return canvas
            },
            type: 'img'
        },
        {
            title: 'flow chart (png)',
            action: (xmlDoc) => {
                const canvas = prepare2DCanvas()
                renderFlowAsSequence(convertFlow(xmlDoc), canvas)
                return canvas
            },
            type: 'img'
        },
        {
            title: 'tree chart (svg)',
            action: (xmlDoc) => {
                return new SvgTreeChart(convertFlow(xmlDoc), document).draw()
            },
            type: 'svg'
        }
    ]
}

