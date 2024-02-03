import convertFlow from "../../lib/convertFlow.mjs";
import renderFlowOnCirle from "../../lib/imgFlowChart/imgCircleChart.mjs";
import renderFlowAsSequence from "../../lib/imgFlowChart/imgSequenceChart.mjs";
import SvgTreeChart from "../../lib/svgFlowChart/svgTreeChart.mjs";

// region парочка глобальных переменных а ля конфиг
// такие а ля нам не нужны, конфиг так конфиг
var canvasDimensions = { width: 1300, height: 1300 };
var flowOnCirle = (model) => renderFlowOnCirle(model, prepare2DCanvas());
var sequenceFlow = (model) => renderFlowAsSequence(model, prepare2DCanvas());
var svgTreeChartFlow = (model) => renderFlowAsSvgTreeChart(model);
/**
 * Набор возможных алгоритмов визуализации графа
 */
var renderService = {
    cirleView: flowOnCirle,
    sequenceView: sequenceFlow,
    svgTreeChartView: svgTreeChartFlow
};
// endregion

/**
 * Подготовка управляющих элементов
 */
window.prepareControls = function prepareControls() {
    Object.keys(renderService).forEach(key => {
        let option = document.createElement("option");
        option.value = key;
        option.text = key;
        document.getElementById("renderType").append(option);
    })
}
/**
 * Визуализация стейтов воркфлоу
 */
window.visualize =function visualize() {
    const xmlDoc = getXmlDocument();
    let innerModel = convertFlow(xmlDoc)
    // здесь выбираем метод рендера
    let renderType = document.getElementById("renderType").value;
    renderService[renderType](innerModel);
}

/**
 * Подготовка канваса, зависит от метода отрисовки, 
 * поэтому стоит вынести в отдельную мапу с лямблами для выбора способа рендера
 * или создавать внутри рисовалки и возвращать ка ноду DOM
 * 
 * @returns {CanvasRenderingContext2D} контекст для рисования
 */
function prepare2DCanvas() {
    document.getElementById("graph").innerHTML = '';

    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.id = "flowCanvas";
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    canvasDocElement.style.width = '100%' 
    document.getElementById("graph").append(canvasDocElement);
    return canvasDocElement.getContext('2d')
}

function getXmlDocument() {
    const parser = new DOMParser();
    const xmlString = document.getElementById("flowInput").value;
    return parser.parseFromString(xmlString, "text/xml");
}

function renderFlowAsSvgTreeChart(model) {
    document.getElementById("graph").innerHTML = '';
    document.getElementById("graph").append(
        new SvgTreeChart(model, document).draw()
    );
}

// export {prepareControls, visualize}