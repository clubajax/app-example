define([], function () {

    var indicationShape = {
        frameTipPosition: { x: 0.0, y: 0.0 },
        frameTopClosestToAxisPosition: { x: 0.0, y: 0.0 },
        frameTopFarestToAxisPosition: { x: 0.0, y: 0.0 },
        frameBottomClosestToAxisPosition: { x: 0.0, y: 0.0 },
        frameBottomFarestToAxisPosition: { x: 0.0, y: 0.0 }
    };

    indicationShape.frameShape = [
            indicationShape.frameTipPosition,
            indicationShape.frameTopClosestToAxisPosition,
            indicationShape.frameTopFarestToAxisPosition,
            indicationShape.frameBottomFarestToAxisPosition,
            indicationShape.frameBottomClosestToAxisPosition
    ];

    return indicationShape;
});