// static field
let canvasDimensions 

/**
 * Отрисовка графа, где вершины расположены на окружности
 * @param {данные отображаемого графа} graphModel 
 * @param {CanvasRenderingContext2D} ctx тут рисуем
 */
export default function renderFlowOnCirle(graphModel, ctx) {
    canvasDimensions = {
        width: ctx.canvas.width,
        height: ctx.canvas.width
    }
    
    const centralCircle = { x: canvasDimensions.width / 2, y: canvasDimensions.height / 2, offset: 80 };
    const flowDimensions = { width: 190, height: 50 };
    const stateCount = Object.keys(graphModel.states).length;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
