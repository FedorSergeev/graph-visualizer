let canvasDimensions

/**
 * Отрисовка графа в виде последовательности вершин слева направо, начиная от вершины, обозначающей вход в бизнес-процесс, далее все
 * вершины, имеющие прямую или обратную связь с текущей, и так далее
 * @param {модель графа для визуализации} model
 * @param {CanvasRenderingContext2D} context
 */
export default function renderFlowAsSequence(model, canvas) {
    canvasDimensions = {
        width: canvas.width,
        height: canvas.height
    }
    // распределяем флоу на группы стейтов, которые расположены вертиклаьно
    let view = {
        bounds: { x: 0, y: 0 },
        stateBounds: { width: 190, height: 150 },
        stateColumns: Array()
    };

    let usedStateNames = [model.enterState];
    let hasNextColumn = true;
    let maxColumnSize = 0;
    view.stateColumns.push([{
        model: model.states[model.enterState],
        name: model.enterState
    }]);

    while (hasNextColumn) {
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
            view.stateColumns.push([{ model: model.states[stateKey], name: stateKey }]);
        }
    });

    view.bounds.x = view.stateBounds.width * ((view.stateColumns.length * 2) + 1);
    view.bounds.y = view.stateBounds.height * ((maxColumnSize * 2) + 1);


    canvas.width = view.bounds.x;
    canvas.height = view.bounds.y;

    const context = canvas.getContext('2d');

    canvasDimensions.width = canvas.width;
    canvasDimensions.height = canvas.height;


    let stateCoordinatesByName = {};

    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, view.bounds.x, view.bounds.y);
    context.stroke();

    for (let i = 0; i < view.stateColumns.length; i++) {
        for (let y = 0; y < view.stateColumns[i].length; y++) {
            renderSequenceState(view, i, y, context);
            stateCoordinatesByName[view.stateColumns[i][y].name] = {
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
                            srcX: srcX,
                            srcY: srcY + connectorOutgoingOffsetY,
                            destX: destX,
                            destY: destY + connectorOutgoingOffsetY - 10 * stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].freeIncomingPosition,
                            srcColNum: i,
                            srcRowNum: y,
                            destColNum: stateCoordinatesByName[view.stateColumns[i][y].model.connectors[connectorIndex].to].cellPositionX,
                            connectorCentralOffsetX: connectorCentralOffsetX,
                            connectorCentralOffsetY: connectorOutgoingOffsetY
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
        ? arrow.srcX + arrow.connectorCentralOffsetX + view.stateBounds.width * 0.65
        : arrow.srcX + arrow.connectorCentralOffsetX - view.stateBounds.width * 0.65;

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
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle - Math.PI / 7), arrow.destY - arrowHeadLength * Math.sin(angle - Math.PI / 9));
    context.stroke();

    context.beginPath();
    context.moveTo(arrow.destX, arrow.destY);
    context.lineTo(arrow.destX - arrowHeadLength * Math.cos(angle + Math.PI / 7), arrow.destY - arrowHeadLength * Math.sin(angle + Math.PI / 9));
    context.stroke();
}
