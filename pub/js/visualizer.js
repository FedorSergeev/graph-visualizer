// region парочка глобальных переменных а ля конфиг
var canvasDimensions = { "width": 1300, "height": 1300 };


// endregion


/**
 * Визуализация стейтов воркфлоу
 */
function visualize() {

    // region подготовка канваса, зависит от метода отрисовки, поэтому стоит вынести в отдельную мапу с лямблами для выбора способа рендера
    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.id = "flowCanvas";
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    document.getElementById("content").append(canvasDocElement);

    const parser = new DOMParser();
    const xmlString = document.getElementById("flowInput").value;
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Можно расскомментировать для понимания, откуда берется расстановка стейтов
    // drawCircle(ctx);

    // Для каждой ноды типа state рисуем свой квадрат
    const numberOfStates = xmlDoc.childNodes[0].childElementCount;
    var graphModel = createGraphModel();

    for (let stateIndex = 0; stateIndex < numberOfStates; stateIndex++) {
        let stateModel = createStateModel();
        stateModel.properties = {};
        stateModel.connectors = Array();
        stateModel.type = "decision";
        stateModel.description = xmlDoc.childNodes[0].children[stateIndex].getAttribute("title");

        let xmlTransitions = Array.from(xmlDoc.childNodes[0].children[stateIndex].children).filter(child => "state-transition" === child.tagName);
        for (let transitionIndex = 0; transitionIndex < xmlTransitions.length; transitionIndex++) {
            stateModel.connectors.push({
                "name": xmlTransitions[transitionIndex].getAttribute("name"),
                "to": xmlTransitions[transitionIndex].getAttribute("to")
            });
        }
        graphModel.states[xmlDoc.childNodes[0].children[stateIndex].getAttribute("name")] = stateModel;
    }

    // todo здесь выбираем метод рендера
    renderFlowOnCirle(graphModel);
}

/**
 * Отрисовка графа, где вершины расположены на окружности
 * @param {данные отображаемого графа} graphModel 
 */
function renderFlowOnCirle(graphModel) {
    const centralCircle = { "x": canvasDimensions.width / 2, "y": canvasDimensions.height / 2, "offset": 80 };
    const flowDimensions = { "width": 190, "height": 50 };
    const stateCount = Object.keys(graphModel.states).length;
    const ctx = document.getElementById("flowCanvas").getContext("2d");

    let graphView = { "stateViews": {} };
    let currentStateIndex = 0;
    for (let index in graphModel.states) {
        let stateView = {
            "name": index,
            "nextStates": graphModel.states[index].connectors.map(connector => connector.to),
            "incomingArrows": [],
            "outgoingArrows": []
        };
        let outgoingYCoordinate = getStateRectangleYCoordinate(currentStateIndex, stateCount, centralCircle, flowDimensions) + centralCircle.offset;
        if (outgoingYCoordinate > centralCircle.y) {
            outgoingYCoordinate -= flowDimensions.height;
        }

        let incomingYCoordinate = getStateRectangleYCoordinate(currentStateIndex, stateCount, centralCircle, flowDimensions) + centralCircle.offset - (flowDimensions.height / 2);

        let incomingXCoordinate = getStateRectangleXCoordinate(currentStateIndex, stateCount, centralCircle, flowDimensions) + (flowDimensions.width / 2);
        if (incomingXCoordinate < centralCircle.x) {
            incomingXCoordinate += flowDimensions.width / 2;
        } else {
            incomingXCoordinate -= flowDimensions.width / 2;
        }

        stateView.outgoingArrows.push({
            "x": getStateRectangleXCoordinate(currentStateIndex, stateCount, centralCircle, flowDimensions) + (flowDimensions.width / 2),
            "y": outgoingYCoordinate
        });

        stateView.incomingArrows.push({
            "x": incomingXCoordinate,
            "y": incomingYCoordinate
        });

        drawFlowState(ctx, stateView, currentStateIndex, stateCount, centralCircle, flowDimensions);
        graphView.stateViews[stateView.name] = stateView;
        currentStateIndex++;
    }

    // Для каждой вершины находим исходящие ребра и добавляем их к визуализации
    Object.keys(graphView.stateViews).forEach(viewKey => {
        let arrows = Array();
        let outgoingState = graphView.stateViews[viewKey];
        for (let keyIndex = 0; keyIndex < outgoingState.nextStates.length; keyIndex++) {
            let nextStateName = outgoingState.nextStates[keyIndex];
            let nextState = graphView.stateViews[nextStateName];
            if (nextState) {
                let destination = nextState.incomingArrows[0];
                arrows.push({
                    srcX: outgoingState.outgoingArrows[0].x,
                    srcY: outgoingState.outgoingArrows[0].y,
                    destX: destination.x,
                    destY: destination.y
                })
            }
        }
        arrows.forEach(arrow => renderArrow(arrow, ctx));
    });
}


function renderArrow(arrow, context) {
    context.beginPath();
    context.moveTo(arrow.srcX, arrow.srcY);
    context.lineTo(arrow.destX, arrow.destY);

    // Draw the Path
    context.stroke();
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
 * Рисуем маленькую жирненькую точечку, откуда могут выходить или приходить стрелки
 * @param {2D контекст} context
 * @param {Х координата точки} x
 * @param {Y координата точки} y
 */
function drawFilledFlowPoint(context, x, y) {
    context.beginPath();
    context.arc(x, y, 4, 0, 2 * Math.PI, false);
    context.fillStyle = '#000000';
    context.fill();
    context.strokeStyle = '#003300';
    context.stroke();
}

/**
 * Рисуем маленькую жирненькую точечку, откуда могут выходить или приходить стрелки
 * @param {2D контекст} context
 * @param {Х координата точки} x
 * @param {Y координата точки} y
 */
function drawFlowPoint(context, x, y) {
    context.beginPath();
    context.arc(x, y, 4, 0, 2 * Math.PI, false);
    context.fillStyle = '#ffffff';
    context.fill();
    context.strokeStyle = '#003300';
    context.stroke();
}

/**
 * Рисуем квадрат со стейтом и со всей хурмой
 * @param {2D контекст} context 
 * @param {визуальное представление текущей вершины} stateView 
 * @param {номер вершины} stateIndex 
 * @param {общее число вершин графа} numberOfStates 
 * @param {конфигурация окружности, на которой рисуются вершины графа} centralCircle
 * @param {конфигурация для отрисовки вершины графа} flowDimensions 
 */
function drawFlowState(context, stateView, stateIndex, numberOfStates, centralCircle, flowDimensions) {
    console.log("drawFlowState: DEBUG centralCirle = " + centralCircle + ", flowDimensions = " + flowDimensions);

    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.rect(getFlowStateOffsetX(stateIndex, numberOfStates, centralCircle, flowDimensions),
        getFlowStateOffsetY(stateIndex, numberOfStates, centralCircle, flowDimensions),
        flowDimensions.width,
        flowDimensions.height);
    context.stroke();

    drawFlowPoint(context, stateView.outgoingArrows[0].x, stateView.outgoingArrows[0].y);
    drawFilledFlowPoint(context, stateView.incomingArrows[0].x, stateView.incomingArrows[0].y);

    let titleCoordinateX = getStateRectangleXCoordinate(stateIndex, numberOfStates, centralCircle, flowDimensions);
    let titleCoordinateY = getStateRectangleYCoordinate(stateIndex, numberOfStates, centralCircle, flowDimensions) + 45;
    context.font = "14px Arial";
    context.fillStyle = "#000000";
    context.fillText(stateView.name, titleCoordinateX, titleCoordinateY);
}

/**
 * Рассчитывает смещение по абсциссе для верхней левой точки прямоугольника, который визуализирует стейт
 * @param {порядковый номер стейта} stateIndex 
 * @param {количество стейтов} numberOfStates 
 * @param {конфигурация окружности, на которой расположены вершины графа} centralCircle 
 * @param {конфигурация для отрисовки вершины графа} flowDimensions 
 */
function getFlowStateOffsetX(stateIndex, numberOfStates, centralCircle, flowDimensions) {
    let angle = ((2 * Math.PI) / numberOfStates) * (stateIndex + 1);
    let radius = canvasDimensions.height / 2 - centralCircle.offset;
    return centralCircle.x + radius * Math.cos(angle) - flowDimensions.width / 2;
}

/**
 * Рассчитывает смещение по абсциссе для верхней левой точки прямоугольника, который визуализирует стейт
 * @param {порядковый номер стейта} stateIndex 
 * @param {количество стейтов} numberOfStates 
 * @param {конфигурация для отрисофки вершины графа} flowDimensions 
 */
function getFlowStateOffsetY(stateIndex, numberOfStates, centralCircle, flowDimensions) {
    console.log("getFlowStateOffsetY: DEBUG centralCirle = " + centralCircle + ", flowDimensions = " + flowDimensions);
    let angle = ((2 * Math.PI) / numberOfStates) * (stateIndex + 1);
    let radius = canvasDimensions.height / 2 - centralCircle.offset;
    return centralCircle.x + radius * Math.sin(angle) - flowDimensions.height / 2;
}

function getStateRectangleXCoordinate(stateIndex, numberOfStates, centralCircle, flowDimensions) {
    console.log("getStateRectangleXCoordinate: DEBUG centralCirle = " + centralCircle + ", flowDimensions = " + flowDimensions);
    return getFlowStateOffsetX(stateIndex, numberOfStates, centralCircle, flowDimensions) + 5;
}

function getStateRectangleYCoordinate(stateIndex, numberOfStates, centralCircle, flowDimensions) {
    console.log("getStateRectangleYCoordinate: DEBUG centralCirle = " + centralCircle + ", flowDimensions = " + flowDimensions);
    return getFlowStateOffsetY(stateIndex, numberOfStates, centralCircle, flowDimensions) - 25;
}

/**
 * Создает модель графа
 * @returns модель графа, используемая потребителями: как разного рода рендерами, так и приложениями в качестве описание бизнес-процесса
 */
function createGraphModel() {
    return {
        "apiVerion": "1",
        "enterState": "",
        "terminator": "",
        "description": "",
        "properties": {},
        "states": {}
    };
};

/**
 * Создает пустую вершину графа (состояние конечного автомата)
 * @returns модель вершины графа
 */
function createStateModel() {
    return {
        "type": "decision | process | external",
        "description": "state",
        "properties": {},
        "connectors": []
    };
}