// region парочка глобальных переменных а ля конфиг
var canvasDimensions = { width: 1300, height: 1300 };
var flowOnCirle = (model) => renderFlowOnCirle(model);
var sequenceFlow = (model) => renderFlowAsSequence(model);
/**
 * Набор возможных алгоритмов визуализации графа
 */
var renderService = {
    cirleView: flowOnCirle,
    sequenceView: sequenceFlow
};
/**
 * Выбранный метод отрисовки графа
 */
var renderType = "sequenceView";
// endregion

/**
 * Визуализация стейтов воркфлоу
 */
function visualize() {

    prepare2DCanvas();

    const xmlDoc = getXmlDocument();

    // Для каждой ноды типа state рисуем свой квадрат
    const numberOfStates = xmlDoc.childNodes[0].childElementCount;
    var graphModel = createGraphModel();
    graphModel.enterState = xmlDoc.children[0].getAttribute("start-state");

    // from krieven
//    let innerModel = convertFlow(xmlDoc)

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
    renderService[renderType](graphModel);

//  from krieven
//    renderFlowOnCirle(innerModel);
//
//    let draw = new SvgTreeChart(innerModel, document).draw()

//    document.body.insertBefore(draw, document.getElementById("content"))
}

/**
 * Подготовка канваса, зависит от метода отрисовки, поэтому стоит вынести в отдельную мапу с лямблами для выбора способа рендера
 */
function prepare2DCanvas() {
    if (document.getElementById("flowCanvas")) {
            document.getElementById("flowCanvas").remove();
    }
    const canvasDocElement = document.createElement("canvas");
    canvasDocElement.id = "flowCanvas";
    canvasDocElement.width = canvasDimensions.width;
    canvasDocElement.height = canvasDimensions.height;
    canvasDocElement.style.width = '100%'


    document.getElementById("graph").append(canvasDocElement);
}

function getXmlDocument() {
    const parser = new DOMParser();
    const xmlString = document.getElementById("flowInput").value;
    return parser.parseFromString(xmlString, "text/xml");
}

/**
 * Отрисовка графа в виде последовательности вершин слева направо, начиная от вершины, обозначающей вход в бизнес-процесс, далее все
 * вершины, имеющие прямую или обратную связь с текущей, и так далее
 * @param {модель графа для визуализации} model
 */
function renderFlowAsSequence(model) {
    // распределяем флоу на группы стейтов, которые расположены вертиклаьно
    let view = {
        bounds: {x: 0, y: 0},
        stateBounds: {width: 190, height: 150},
        stateColumns : Array()
    };

    let usedStateNames = [model.enterState];
    let hasNextColumn = true;
    let maxColumnSize = 0;
    view.stateColumns.push([{
        model: model.states[model.enterState],
        name: model.enterState
    }]);

    while(hasNextColumn) {
        let nextColumn = Array();
        hasNextColumn = false;
        for (let stateIndex = 0; stateIndex < view.stateColumns[view.stateColumns.length - 1].length; stateIndex++) {
            let currentState = view.stateColumns[view.stateColumns.length - 1][stateIndex].model;
            for (let connectorIndex = 0; connectorIndex < currentState.connectors.length; connectorIndex++) {
                if (currentState.connectors[connectorIndex].to !== "end" & !usedStateNames.includes(currentState.connectors[connectorIndex].to)) {
                    usedStateNames.push(currentState.connectors[connectorIndex].to);
                    hasNextColumn = true;
                    let stateView = {
                        model: model.states[currentState.connectors[connectorIndex].to],
                        name: currentState.connectors[connectorIndex].to
                    }
                    nextColumn.push(stateView);
                }
            }
        }
        if (nextColumn.length > 0) {
            view.stateColumns.push(nextColumn);
            if (nextColumn.length > maxColumnSize) {
                maxColumnSize = nextColumn.length;
            }
        }
    }

    Object.keys(model.states).forEach(stateKey => {
        if (!usedStateNames.includes(stateKey)) {
            view.stateColumns.push([{model: model.states[stateKey], name: stateKey}]);
        }
    });

    view.bounds.x = view.stateBounds.width * ((view.stateColumns.length * 2) + 1);
    view.bounds.y = view.stateBounds.height * ((maxColumnSize * 2) + 1);

    canvasDimensions.width = view.bounds.x;
    canvasDimensions.height = view.bounds.y;

    prepare2DCanvas();

    const context = document.getElementById("flowCanvas").getContext("2d");

    let stateCoordinatesByName = {};

    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0,view.bounds.x, view.bounds.y);
    context.stroke();

    for (let i = 0; i < view.stateColumns.length; i++) {
        for (let y = 0; y < view.stateColumns[i].length; y++) {
            renderSequenceState(view, i, y, context);
            stateCoordinatesByName[view.stateColumns[i][y].name] =  {
                x: view.stateColumns[i][y].rectCoordinateX,
                y: view.stateColumns[i][y].rectCoordinateY,
                cellPositionX: i,
                cellPositionY: y,
                freeIncomingPosition: 1
            };
        }
    }
    for (let i = 0; i < view.stateColumns.length; i++) {
        let connectorCentralOffsetX = 0;
        for (let y = 0; y < view.stateColumns[i].length; y++) {

            let connectorOutgoingOffsetY = 0;
            for (let connectorIndex = 0; connectorIndex < view.stateColumns[i][y].model.connectors.length; connectorIndex++) {

                if (stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to]) {
                    let srcX = view.stateColumns[i][y].rectCoordinateX + view.stateBounds.width;
                    let srcY = view.stateColumns[i][y].rectCoordinateY + view.stateBounds.height / 2;
                    let destX = stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].x;
                    let destY = stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].y + view.stateBounds.height / 2;


                if (destX < srcX) {
                    srcX -= view.stateBounds.width;
                    destX += view.stateBounds.width;
                }

                renderArrowOnSequenceGraph(
                    {
                        srcX : srcX,
                        srcY : srcY + connectorOutgoingOffsetY,
                        destX : destX,
                        destY: destY + connectorOutgoingOffsetY - 10 * stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].freeIncomingPosition,
                        srcColNum : i,
                        srcRowNum : y,
                        destColNum : stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].cellPositionX,
                        connectorCentralOffsetX : connectorCentralOffsetX,
                        connectorCentralOffsetY : connectorOutgoingOffsetY
                    },
                    view,
                    context
                );
                }
                connectorOutgoingOffsetY += 5;
                connectorCentralOffsetX += 5;
                if (stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to]) {
                    stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].freeIncomingPosition++;
                }
            }
        }
    }
}

function renderSequenceState(view, index, indexY, context) {
    view.stateColumns[index][indexY]["rectCoordinateX"] = view.stateBounds.width + view.stateBounds.width * index * 2;
    view.stateColumns[index][indexY]["rectCoordinateY"] = (view.bounds.y - ((view.stateColumns[index].length * 2) - 1) * view.stateBounds.height) / 2 + (view.stateBounds.height * indexY * 2);
    view.stateColumns[index][indexY]["cellPositionX"] = index;
    view.stateColumns[index][indexY]["cellPositionY"] = indexY;

    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.rect(view.stateColumns[index][indexY].rectCoordinateX,
                view.stateColumns[index][indexY].rectCoordinateY,
                view.stateBounds.width,
                view.stateBounds.height);
    context.stroke();

    context.font = "14px Arial";
    context.fillStyle = "#000000";
    context.fillText(view.stateColumns[index][indexY].name,
                    view.stateColumns[index][indexY].rectCoordinateX + 10,
                     view.stateColumns[index][indexY].rectCoordinateY + 15);
}

/**
 * Рисут соединение между вершинами графа со стрелкой на грфе, отображенном в виде посоедовательности
 * @param {ребро направленного графа} arrow
 * @param {2D контекст} context
 */
function renderArrowOnSequenceGraph(arrow, view, context) {
    if (arrow.srcColNum > arrow.destColNum) {
        arrow.srcY -= view.stateBounds.height / 3.5;
        arrow.destY -= view.stateBounds.height / 3.5;
    } else if (arrow.srcColNum < arrow.destColNum) {
        arrow.srcY += view.stateBounds.height / 3.5;
        arrow.destY += view.stateBounds.height / 3.5;
    }

    let xLineTo = arrow.srcColNum < arrow.destColNum
        ? arrow.srcX  + arrow.connectorCentralOffsetX + view.stateBounds.width * 0.65
        : arrow.srcX  + arrow.connectorCentralOffsetX - view.stateBounds.width * 0.65;

    context.beginPath();
    context.moveTo(arrow.srcX, arrow.srcY);

    context.lineTo(xLineTo, arrow.srcY);
    context.stroke();

    context.beginPath();
    context.moveTo(xLineTo, arrow.srcY);
    context.lineTo(xLineTo, arrow.destY);
    context.stroke();

    context.beginPath();
    context.moveTo(xLineTo, arrow.destY);
    context.lineTo(arrow.destX, arrow.destY);
    context.stroke();

    const angle = arrow.srcColNum < arrow.destColNum ? 0 : Math.PI;
    const arrowHeadLength = 20;
    context.beginPath();
    context.moveTo(arrow.destX, arrow.destY);
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle-Math.PI/7), arrow.destY - arrowHeadLength * Math.sin(angle-Math.PI/9));
    context.stroke();

    context.beginPath();
    context.moveTo(arrow.destX, arrow.destY);
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle + Math.PI/7), arrow.destY - arrowHeadLength * Math.sin(angle + Math.PI/9));
    context.stroke();
}

/**
 * Отрисовка графа, где вершины расположены на окружности
 * @param {данные отображаемого графа} graphModel 
 */
function renderFlowOnCirle(graphModel) {
    const centralCircle = { x: canvasDimensions.width / 2, y: canvasDimensions.height / 2, offset: 80 };
    const flowDimensions = { width: 190, height: 50 };
    const stateCount = Object.keys(graphModel.states).length;
    const ctx = document.getElementById("flowCanvas").getContext("2d");
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    let graphView = { "stateViews": {} };
    let currentStateIndex = 0;
    for (let index in graphModel.states) {
        let stateView = {
            name: index,
            nextStates: graphModel.states[index].connectors.map(connector => connector.to),
            incomingArrows: [],
            outgoingArrows: []
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


/**
 * Рисут стрелку в конце ребра графа для понимания, в какую сторону он направлен
 * @param {ребро направленного графа} arrow 
 * @param {2D контекст} context 
 */
function renderArrow(arrow, context) {
    context.beginPath();
    context.moveTo(arrow.srcX, arrow.srcY);
    context.lineTo(arrow.destX, arrow.destY);
    context.stroke();

    const angle = Math.atan2(arrow.destY - arrow.srcY, arrow.destX - arrow.srcX);
    const arrowHeadLength = 20;
    context.beginPath();
    context.moveTo(arrow.destX, arrow.destY);
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle - Math.PI / 7), arrow.destY - arrowHeadLength * Math.sin(angle - Math.PI / 9));
    context.stroke();

    context.beginPath();
    context.moveTo(arrow.destX, arrow.destY);
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle + Math.PI / 7), arrow.destY - arrowHeadLength * Math.sin(angle + Math.PI / 9));
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

/**
 * 
 * @param {порядковый номер вершины} stateIndex 
 * @param {количество вершин графа} numberOfStates 
 * @param {конфигурация окружности, на которой рисуются вершины} centralCircle 
 * @param {конфигурация для отображения вершины графа} flowDimensions 
 * @returns отступ по оси Х для указанной вершины графа
 */
function getStateRectangleXCoordinate(stateIndex, numberOfStates, centralCircle, flowDimensions) {
    console.log("getStateRectangleXCoordinate: DEBUG centralCirle = " + centralCircle + ", flowDimensions = " + flowDimensions);
    return getFlowStateOffsetX(stateIndex, numberOfStates, centralCircle, flowDimensions) + 5;
}

/**
 * 
 * @param {порядковый номер вершины} stateIndex 
 * @param {количество вершин графа} numberOfStates 
 * @param {конфигурация окружности, на которой рисуются вершины} centralCircle 
 * @param {конфигурация для отображения вершины графа} flowDimensions 
 * @returns отступ по оси Н для указанной вершины графа
 */
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