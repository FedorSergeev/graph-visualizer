// region парочка глобальных переменных а ля конфиг
var canvasDimensions = {"width": 1300, "height": 1300};
var centralCircle = {"x": canvasDimensions.width / 2, "y": canvasDimensions.height / 2, "offset": 80};
var flowDimensions = {"width": 190, "height": 50};

// endregion


/**
 * Визуализация стейтов воркфлоу
 */
function visualize() {
    const parser = new DOMParser();

    const xmlString = document.getElementById("flowInput").value;
    const xmlDoc = parser.parseFromString(xmlString,"text/xml");

    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.id = "flowCanvas";
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    document.getElementById("content").append(canvasDocElement);

    const c = document.getElementById("flowCanvas");
    const ctx = c.getContext("2d");

    // Можно расскомментировать для понимания, откуда берется расстановка стейтов
    // drawCircle(ctx);

    // Для каждой ноды типа state рисуем свой квадрат
    const numberOfStates = xmlDoc.childNodes[0].childElementCount;
    var states = Array();
    for (let stateIndex = 0; stateIndex < numberOfStates; stateIndex++) {
        states.push(createState(xmlDoc.childNodes[0].children[stateIndex]));
    }

    for (let index = 0; index < states.length; index++) {
    //     state.view.outgoingArrows.push({
    //         "x": getStateRectangleXCoordinate(index, states.length) - flowDimensions.width / 2,
    //         "y": getStateRectangleYCoordinate(index, states.length)
    // });
    //     state.view.incomingArrows.push()
        drawFlowState(ctx, states[index], index, states.length);
    }
    
    
}

/**
 * Создает представление стейта для последующей визуализации на основе данных из воркфлоу ЕФС
 * @param {представление стейта в рамках ЕФС воркфлоу} xmlNode 
 */
function createState(xmlNode) {
    var state = {
         "name" : xmlNode.getAttribute("name"),
         "title": xmlNode.getAttribute("title"),
         "onEnter": xmlNode.getAttribute("on-enter"),
         "outGoingTransitionCount": Array.from(xmlNode.children).filter(element => "state-transition" === element.tagName).length,
         "view": {
            "incomingArrows":[],
            "outgoingArrows":[]
         }
    }
    return state;
}

/**
 * Рисует круг, на грани которого отображаются стейты флоу
 * @param {Контекст канваса} context 
 */
function drawCircle(context) {
    context.beginPath();
    context.arc(centralCircle.x, centralCircle.y, canvasDimensions.height / 2 - centralCircle.offset, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
}

/**
 * Рисуем квадрат со стейтом и со всей хурмой
 */
function drawFlowState(context, state, stateIndex, numberOfStates) {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.rect(getFlowStateOffsetX(stateIndex, numberOfStates), getFlowStateOffsetY(stateIndex, numberOfStates), flowDimensions.width, flowDimensions.height);
    context.stroke();

    context.font = "14px Arial";
    context.strokeStyle = '#ffffff';
    context.fillText(state.name, getStateRectangleXCoordinate(stateIndex, numberOfStates), getStateRectangleYCoordinate(stateIndex, numberOfStates));
}

/**
 * Рассчитывает смещение по абсциссе для верхней левой точки прямоугольника, который визуализирует стейт
 * @param {порядковый номер стейта} stateIndex 
 * @param {количество стейтов} numberOfStates 
 */
function getFlowStateOffsetX(stateIndex, numberOfStates) {
    let angle = ((2 * Math.PI) / numberOfStates) * (stateIndex + 1);
    let radius = canvasDimensions.height / 2 - centralCircle.offset;
    return centralCircle.x + radius * Math.cos(angle) - flowDimensions.width / 2;
}

/**
 * Рассчитывает смещение по абсциссе для верхней левой точки прямоугольника, который визуализирует стейт
 * @param {порядковый номер стейта} stateIndex 
 * @param {количество стейтов} numberOfStates 
 */
function getFlowStateOffsetY(stateIndex, numberOfStates) {
    let angle = ((2 * Math.PI) / numberOfStates) * (stateIndex + 1);
    let radius = canvasDimensions.height / 2 - centralCircle.offset;
    return centralCircle.x + radius * Math.sin(angle) - flowDimensions.height / 2;
}

function getStateRectangleXCoordinate(stateIndex, numberOfStates) {
    return getFlowStateOffsetX(stateIndex, numberOfStates) + 5;
}

function getStateRectangleYCoordinate(stateIndex, numberOfStates) {
    return getFlowStateOffsetY(stateIndex, numberOfStates) + 15;
}