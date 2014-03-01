
requirejs.config({
    baseUrl: '../../../../../',
    paths: {
        'chart': './src/chart',
        'plugins': './src/plugins',
        'common': './src/common',
        'i18n': './lib/i18n'
    }
});


require([
        "./lib/domReady",
        "chart/chart",
        "chart/SeriePainters/SeriePainterFactory",
        "plugins/resourceManager/ResourceManager",
        "plugins/interaction/broker/broker",
        "common/userInteractionTypes",
        "common/ChartTypes",
        "plugins/interaction/selection/selection",
        "plugins/interaction/crosshair/crosshair",
        "plugins/interaction/drawingObjectEdition/drawingObjectEditor",
        "plugins/interaction/horizontalZoom/horizontalZoom",
        "plugins/interaction/verticalZoom/verticalZoom",
        "plugins/interaction/drawingObjectCreation/drawingObjectCreator",
        "./lib/jquery"
],
    function (domReady, Chart, seriePainterFactory, resourceMananger, Broker, userInteractionTypes, chartTypes, Selection, Crosshair, DrawingObjectEditor, HorizontalZoom, VerticalZoom, DrawingObjectCreator) {

        domReady(function () {

            var $container = $('#parent'),
                broker = new Broker();

            broker.pluginsStack.push(
                new DrawingObjectCreator({
                    $domElement: $container,
                    defaultAxisIndex: 0,
                    isActive: false,
                    isPersistent: false,
                    beforeAddCallback: function (objectSettings) {

                        return true;
                    },
                    afterAddCallback: function (serie) {


                    },
                    objectSettingsTemplate: {
                        inputs: [
                        {
                            name: 'point1',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point2',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }, {
                            name: 'point3',
                            value: {
                                price: null,
                                timeStamp: null
                            }
                        }],
                        definesScaling: false,
                        data: [],
                        layers: [
                        {
                            isSelected: false,
                            chartType: {
                                name: chartTypes.horizontalLine,
                                settings: {
                                    draw: {
                                        color: '125, 125, 255',
                                        width: 3.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 0
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: chartTypes.horizontalLine,
                                settings: {
                                    draw: {
                                        color: '25, 255, 25',
                                        width: 3.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 1
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: chartTypes.horizontalLine,
                                settings: {
                                    draw: {
                                        color: '250, 250, 250',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 2
                                }]
                            }
                        },
                        {
                            isSelected: false,
                            chartType: {
                                name: chartTypes.verticalLine,
                                settings: {
                                    draw: {
                                        color: '250, 250, 250',
                                        width: 1.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 2
                                }]
                            }
                        },
{
    isSelected: false,
    chartType: {
        name: chartTypes.verticalLine,
        settings: {
            draw: {
                color: '125, 125, 255',
                width: 3.5
            },
            selection: {
                squareSide: 8,
                color: '255, 255, 255',
                width: 0.5
            }
        },
        dataPointDefinitions: [{
            key: 0
        }]
    }
},
                        {
                            isSelected: false,
                            chartType: {
                                name: chartTypes.verticalLine,
                                settings: {
                                    draw: {
                                        color: '25, 255, 25',
                                        width: 3.5
                                    },
                                    selection: {
                                        squareSide: 8,
                                        color: '255, 255, 255',
                                        width: 0.5
                                    }
                                },
                                dataPointDefinitions: [{
                                    key: 1
                                }]
                            }
                        },
                            {
                                isSelected: false,
                                chartType: {
                                    name: chartTypes.trendRay,
                                    settings: {
                                        draw: {
                                            color: '255, 55, 25',
                                            width: 3.5
                                        },
                                        selection: {
                                            squareSide: 8,
                                            color: '255, 255, 255',
                                            width: 0.5
                                        }
                                    },
                                    dataPointDefinitions: [{
                                        key: 0
                                    }, {
                                        key: 1
                                    }]
                                }
                            }
                        ]
                    }
                })
                );
            broker.pluginsStack.push(new Selection());
            broker.pluginsStack.push(
                new DrawingObjectEditor({
                    $domElement: $container,
                    autoSnapCallback: function (snapTos) {
                        var snapTo = null, length = snapTos.length, index = null, i, shortestDistance = Number.MAX_VALUE, distance;

                        for (i = 0; i < length; i++) {

                            snapTo = snapTos[i];

                            distance = Math.sqrt(Math.pow(snapTo.distanceX, 2) + Math.pow(snapTo.distanceY, 2));

                            if (shortestDistance > distance) {
                                index = i;
                                shortestDistance = distance;
                            }
                        }

                        return index === null ? false : snapTos[index];

                    }
                })
            );

            broker.pluginsStack.push(new Crosshair({ $domElement: $container }));
            broker.pluginsStack.push(new HorizontalZoom());
            broker.pluginsStack.push(new VerticalZoom());


            window.chart = new Chart($container, {
                painterFactory: seriePainterFactory,
                resourceManager: resourceMananger,
                userInteractionType: userInteractionTypes.desktop,
                onEventCallback: function (eventType, eventObject) {
                    return broker.onEventCallback(eventType, eventObject);
                },
                xAxis: {
                    limits: 'auto',
                    maximumNumberOfVisibleBars: 100,
                    minimumNumberOfVisibleBars: 5,
                    showLabels: true,
                    showVerticalLines: true
                },
                graphs: [
                    //#region subgraph 1
                    {
                        realEstatePercentage: 1,
                        axes: [{
                            position: 'right',
                            showHorizontalLines: true,
                            showLabels: true,
                            limits: 'auto',
                            scalingType: 'linear',
                            minMove: 0.01,
                            numberFormat: 3,
                            series: [
                                {
                                    data: [{ timeStamp: new Date(2012, 0, 1, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                            { timeStamp: new Date(2012, 0, 2, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                            { timeStamp: new Date(2012, 0, 3, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                            { timeStamp: new Date(2012, 0, 4, 9, 37, 0, 0), values: [{ value: 12.65 }, { value: 12.85 }, { value: 12.47 }, { value: 12.80 }, { value: 224667692 }] },
                            { timeStamp: new Date(2012, 0, 5, 9, 37, 0, 0), values: [{ value: 12.86 }, { value: 12.88 }, { value: 12.52 }, { value: 12.54 }, { value: 189201488 }] },
                            { timeStamp: new Date(2012, 0, 6, 9, 37, 0, 0), values: [{ value: 12.57 }, { value: 12.71 }, { value: 12.33 }, { value: 12.40 }, { value: 161365713 }] },
                            { timeStamp: new Date(2012, 0, 7, 9, 37, 0, 0), values: [{ value: 12.38 }, { value: 12.54 }, { value: 12.28 }, { value: 12.29 }, { value: 160612493 }] },
                            { timeStamp: new Date(2012, 0, 8, 9, 37, 0, 0), values: [{ value: 12.47 }, { value: 12.77 }, { value: 12.38 }, { value: 12.52 }, { value: 309278321 }] },
                            { timeStamp: new Date(2012, 0, 9, 9, 37, 0, 0), values: [{ value: 12.55 }, { value: 12.65 }, { value: 12.45 }, { value: 12.57 }, { value: 154544133 }] },
                            { timeStamp: new Date(2012, 0, 10, 9, 37, 0, 0), values: [{ value: 12.59 }, { value: 12.75 }, { value: 12.57 }, { value: 12.62 }, { value: 113899774 }] },
                            { timeStamp: new Date(2012, 0, 11, 9, 37, 0, 0), values: [{ value: 12.73 }, { value: 12.98 }, { value: 12.70 }, { value: 12.98 }, { value: 163167072 }] },
                            { timeStamp: new Date(2012, 0, 12, 9, 37, 0, 0), values: [{ value: 13.01 }, { value: 13.45 }, { value: 13.00 }, { value: 13.38 }, { value: 240617989 }] },
                            { timeStamp: new Date(2012, 0, 13, 9, 37, 0, 0), values: [{ value: 13.26 }, { value: 13.30 }, { value: 12.97 }, { value: 13.06 }, { value: 184254478 }] },
                            { timeStamp: new Date(2012, 0, 14, 9, 37, 0, 0), values: [{ value: 12.98 }, { value: 13.40 }, { value: 12.96 }, { value: 13.27 }, { value: 116010928 }] },
                            { timeStamp: new Date(2012, 0, 15, 9, 37, 0, 0), values: [{ value: 13.38 }, { value: 13.49 }, { value: 13.34 }, { value: 13.34 }, { value: 119303510 }] },
                            { timeStamp: new Date(2012, 0, 16, 9, 37, 0, 0), values: [{ value: 13.39 }, { value: 13.42 }, { value: 13.31 }, { value: 13.31 }, { value: 74986117 }] },
                            { timeStamp: new Date(2012, 0, 17, 9, 37, 0, 0), values: [{ value: 13.32 }, { value: 13.40 }, { value: 13.26 }, { value: 13.28 }, { value: 88176216 }] },
                            { timeStamp: new Date(2012, 0, 18, 9, 37, 0, 0), values: [{ value: 13.23 }, { value: 13.38 }, { value: 13.22 }, { value: 13.34 }, { value: 63089159 }] },
                            { timeStamp: new Date(2012, 0, 19, 9, 37, 0, 0), values: [{ value: 13.85 }, { value: 14.23 }, { value: 13.80 }, { value: 14.19 }, { value: 354322256 }] },
                            { timeStamp: new Date(2012, 0, 20, 9, 37, 0, 0), values: [{ value: 14.23 }, { value: 14.25 }, { value: 14.02 }, { value: 14.24 }, { value: 218978104 }] },
                            { timeStamp: new Date(2012, 0, 21, 9, 37, 0, 0), values: [{ value: 14.19 }, { value: 14.60 }, { value: 14.15 }, { value: 14.50 }, { value: 246151179 }] },
                            { timeStamp: new Date(2012, 0, 22, 9, 37, 0, 0), values: [{ value: 14.54 }, { value: 14.69 }, { value: 14.34 }, { value: 14.44 }, { value: 241658478 }] },
                            { timeStamp: new Date(2012, 0, 23, 9, 37, 0, 0), values: [{ value: 14.54 }, { value: 14.68 }, { value: 13.98 }, { value: 14.25 }, { value: 392328622 }] },
                            { timeStamp: new Date(2012, 0, 24, 9, 37, 0, 0), values: [{ value: 14.17 }, { value: 14.43 }, { value: 14.09 }, { value: 14.40 }, { value: 185382517 }] },
                            { timeStamp: new Date(2012, 0, 25, 9, 37, 0, 0), values: [{ value: 14.61 }, { value: 14.73 }, { value: 14.53 }, { value: 14.69 }, { value: 212239368 }] },
                            { timeStamp: new Date(2012, 0, 26, 9, 37, 0, 0), values: [{ value: 14.89 }, { value: 14.99 }, { value: 14.85 }, { value: 14.99 }, { value: 204060755 }] },
                            { timeStamp: new Date(2012, 0, 27, 9, 37, 0, 0), values: [{ value: 15.01 }, { value: 15.02 }, { value: 14.72 }, { value: 14.77 }, { value: 159253054 }] },
                            { timeStamp: new Date(2012, 0, 28, 9, 37, 0, 0), values: [{ value: 14.73 }, { value: 15.31 }, { value: 14.68 }, { value: 15.25 }, { value: 282493775 }] },
                            { timeStamp: new Date(2012, 0, 29, 9, 37, 0, 0), values: [{ value: 15.08 }, { value: 15.16 }, { value: 14.85 }, { value: 15.00 }, { value: 198400484 }] },
                            { timeStamp: new Date(2012, 0, 30, 9, 37, 0, 0), values: [{ value: 14.85 }, { value: 14.95 }, { value: 14.35 }, { value: 14.37 }, { value: 247013181 }] },
                            { timeStamp: new Date(2012, 0, 31, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.60 }, { value: 13.94 }, { value: 14.54 }, { value: 245219566 }] },
                            { timeStamp: new Date(2012, 1, 1, 9, 37, 0, 0), values: [{ value: 14.41 }, { value: 14.71 }, { value: 14.22 }, { value: 14.25 }, { value: 291812578 }] },
                            { timeStamp: new Date(2012, 1, 2, 9, 37, 0, 0), values: [{ value: 14.25 }, { value: 14.26 }, { value: 13.88 }, { value: 13.92 }, { value: 225424630 }] },
                            { timeStamp: new Date(2012, 1, 3, 9, 37, 0, 0), values: [{ value: 13.78 }, { value: 13.84 }, { value: 13.40 }, { value: 13.63 }, { value: 303642014 }] },
                            { timeStamp: new Date(2012, 1, 4, 9, 37, 0, 0), values: [{ value: 13.71 }, { value: 13.77 }, { value: 13.55 }, { value: 13.55 }, { value: 145810244 }] },
                            { timeStamp: new Date(2012, 1, 5, 9, 37, 0, 0), values: [{ value: 13.58 }, { value: 13.67 }, { value: 13.48 }, { value: 13.67 }, { value: 153086043 }] },
                            { timeStamp: new Date(2012, 1, 6, 9, 37, 0, 0), values: [{ value: 13.83 }, { value: 14.06 }, { value: 13.58 }, { value: 13.60 }, { value: 226452444 }] },
                            { timeStamp: new Date(2012, 1, 7, 9, 37, 0, 0), values: [{ value: 13.71 }, { value: 13.79 }, { value: 13.64 }, { value: 13.73 }, { value: 118000791 }] },
                            { timeStamp: new Date(2012, 1, 8, 9, 37, 0, 0), values: [{ value: 13.90 }, { value: 14.37 }, { value: 13.87 }, { value: 14.31 }, { value: 211978400 }] },
                            { timeStamp: new Date(2012, 1, 9, 9, 37, 0, 0), values: [{ value: 14.33 }, { value: 14.35 }, { value: 14.13 }, { value: 14.24 }, { value: 140312631 }] },
                            { timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0), values: [{ value: 14.16 }, { value: 14.47 }, { value: 14.15 }, { value: 14.43 }, { value: 145885245 }] },
                            { timeStamp: new Date(2012, 1, 11, 9, 37, 0, 0), values: [{ value: 14.43 }, { value: 14.47 }, { value: 14.11 }, { value: 14.29 }, { value: 141015157 }] },
                            { timeStamp: new Date(2012, 1, 12, 9, 37, 0, 0), values: [{ value: 14.51 }, { value: 14.77 }, { value: 14.43 }, { value: 14.67 }, { value: 149423470 }] },
                            { timeStamp: new Date(2012, 1, 13, 9, 37, 0, 0), values: [{ value: 14.64 }, { value: 14.76 }, { value: 14.50 }, { value: 14.61 }, { value: 158426197 }] },
                            { timeStamp: new Date(2012, 1, 14, 9, 37, 0, 0), values: [{ value: 14.46 }, { value: 14.69 }, { value: 14.41 }, { value: 14.64 }, { value: 150179061 }] },
                            { timeStamp: new Date(2012, 1, 15, 9, 37, 0, 0), values: [{ value: 14.51 }, { value: 14.64 }, { value: 14.47 }, { value: 14.49 }, { value: 132240785 }] },
                            { timeStamp: new Date(2012, 1, 16, 9, 37, 0, 0), values: [{ value: 14.37 }, { value: 14.87 }, { value: 14.35 }, { value: 14.77 }, { value: 156195945 }] },
                            { timeStamp: new Date(2012, 1, 17, 9, 37, 0, 0), values: [{ value: 14.77 }, { value: 14.95 }, { value: 14.71 }, { value: 14.89 }, { value: 112574112 }] },
                            { timeStamp: new Date(2012, 1, 18, 9, 37, 0, 0), values: [{ value: 14.80 }, { value: 14.88 }, { value: 14.69 }, { value: 14.77 }, { value: 109532236 }] },
                            { timeStamp: new Date(2012, 1, 19, 9, 37, 0, 0), values: [{ value: 14.81 }, { value: 14.88 }, { value: 14.70 }, { value: 14.84 }, { value: 132821824 }] },
                            { timeStamp: new Date(2012, 1, 20, 9, 37, 0, 0), values: [{ value: 14.75 }, { value: 14.91 }, { value: 14.73 }, { value: 14.81 }, { value: 103495339 }] },
                            { timeStamp: new Date(2012, 1, 21, 9, 37, 0, 0), values: [{ value: 14.84 }, { value: 14.89 }, { value: 14.67 }, { value: 14.75 }, { value: 98368937 }] },
                            { timeStamp: new Date(2012, 1, 22, 9, 37, 0, 0), values: [{ value: 14.38 }, { value: 14.52 }, { value: 14.09 }, { value: 14.18 }, { value: 187522725 }] },
                            { timeStamp: new Date(2012, 1, 23, 9, 37, 0, 0), values: [{ value: 14.17 }, { value: 14.44 }, { value: 13.92 }, { value: 14.17 }, { value: 196363566 }] },
                            { timeStamp: new Date(2012, 1, 24, 9, 37, 0, 0), values: [{ value: 14.11 }, { value: 14.16 }, { value: 13.79 }, { value: 13.97 }, { value: 201697481 }] },
                            { timeStamp: new Date(2012, 1, 25, 9, 37, 0, 0), values: [{ value: 14.16 }, { value: 14.32 }, { value: 14.12 }, { value: 14.20 }, { value: 126872985 }] },
                            { timeStamp: new Date(2012, 1, 26, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.48 }, { value: 14.16 }, { value: 14.29 }, { value: 137039110 }] },
                            { timeStamp: new Date(2012, 1, 27, 9, 37, 0, 0), values: [{ value: 14.31 }, { value: 14.35 }, { value: 13.91 }, { value: 13.93 }, { value: 161267380 }] },
                            { timeStamp: new Date(2012, 1, 28, 9, 37, 0, 0), values: [{ value: 13.92 }, { value: 14.07 }, { value: 13.81 }, { value: 13.83 }, { value: 115609354 }] },
                            { timeStamp: new Date(2012, 2, 1, 9, 37, 0, 0), values: [{ value: 14.05 }, { value: 14.29 }, { value: 14.05 }, { value: 14.27 }, { value: 139516278 }] },
                            { timeStamp: new Date(2012, 2, 2, 9, 37, 0, 0), values: [{ value: 14.30 }, { value: 14.31 }, { value: 13.98 }, { value: 14.12 }, { value: 146239668 }] },
                            { timeStamp: new Date(2012, 2, 3, 9, 37, 0, 0), values: [{ value: 14.18 }, { value: 14.27 }, { value: 13.92 }, { value: 14.03 }, { value: 139041926 }] },
                            { timeStamp: new Date(2012, 2, 4, 9, 37, 0, 0), values: [{ value: 14.27 }, { value: 14.70 }, { value: 14.20 }, { value: 14.69 }, { value: 250546601 }] },
                            { timeStamp: new Date(2012, 2, 5, 9, 37, 0, 0), values: [{ value: 14.66 }, { value: 14.69 }, { value: 14.48 }, { value: 14.59 }, { value: 148378728 }] },
                            { timeStamp: new Date(2012, 2, 6, 9, 37, 0, 0), values: [{ value: 14.42 }, { value: 14.46 }, { value: 14.26 }, { value: 14.26 }, { value: 155649097 }] },
                            { timeStamp: new Date(2012, 2, 7, 9, 37, 0, 0), values: [{ value: 14.11 }, { value: 14.43 }, { value: 14.10 }, { value: 14.38 }, { value: 111594336 }] },
                            { timeStamp: new Date(2012, 2, 8, 9, 37, 0, 0), values: [{ value: 14.26 }, { value: 14.35 }, { value: 14.07 }, { value: 14.23 }, { value: 112180235 }] },
                            { timeStamp: new Date(2012, 2, 9, 9, 37, 0, 0), values: [{ value: 13.77 }, { value: 14.06 }, { value: 13.71 }, { value: 13.96 }, { value: 167883605 }] },
                            { timeStamp: new Date(2012, 2, 10, 9, 37, 0, 0), values: [{ value: 14.01 }, { value: 14.10 }, { value: 13.66 }, { value: 13.69 }, { value: 178753961 }] },
                            { timeStamp: new Date(2012, 2, 11, 9, 37, 0, 0), values: [{ value: 13.89 }, { value: 14.04 }, { value: 13.75 }, { value: 13.98 }, { value: 131784620 }] },
                            { timeStamp: new Date(2012, 2, 12, 9, 37, 0, 0), values: [{ value: 14.20 }, { value: 14.29 }, { value: 13.98 }, { value: 14.04 }, { value: 199257454 }] },
                            { timeStamp: new Date(2012, 2, 13, 9, 37, 0, 0), values: [{ value: 14.20 }, { value: 14.22 }, { value: 13.90 }, { value: 14.05 }, { value: 114396968 }] },
                            { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), values: [{ value: 14.04 }, { value: 14.05 }, { value: 13.88 }, { value: 13.88 }, { value: 86449108 }] },
                            { timeStamp: new Date(2012, 2, 15, 9, 37, 0, 0), values: [{ value: 13.72 }, { value: 13.74 }, { value: 13.37 }, { value: 13.65 }, { value: 230635542 }] },
                            { timeStamp: new Date(2012, 2, 16, 9, 37, 0, 0), values: [{ value: 13.56 }, { value: 13.59 }, { value: 13.32 }, { value: 13.48 }, { value: 170865143 }] },
                            { timeStamp: new Date(2012, 2, 17, 9, 37, 0, 0), values: [{ value: 13.49 }, { value: 13.53 }, { value: 13.32 }, { value: 13.34 }, { value: 115332233 }] },
                            { timeStamp: new Date(2012, 2, 18, 9, 37, 0, 0), values: [{ value: 13.42 }, { value: 13.56 }, { value: 13.37 }, { value: 13.37 }, { value: 78642394 }] },
                            { timeStamp: new Date(2012, 2, 19, 9, 37, 0, 0), values: [{ value: 13.41 }, { value: 13.41 }, { value: 13.16 }, { value: 13.35 }, { value: 117741630 }] },
                            { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.56 }, { value: 13.27 }, { value: 13.45 }, { value: 121113035 }] },
                            { timeStamp: new Date(2012, 2, 21, 9, 37, 0, 0), values: [{ value: 13.35 }, { value: 13.39 }, { value: 13.29 }, { value: 13.33 }, { value: 87122914 }] },
                            { timeStamp: new Date(2012, 2, 22, 9, 37, 0, 0), values: [{ value: 13.45 }, { value: 13.61 }, { value: 13.35 }, { value: 13.37 }, { value: 95052790 }] },
                            { timeStamp: new Date(2012, 2, 23, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.59 }, { value: 13.40 }, { value: 13.44 }, { value: 71139078 }] },
                            { timeStamp: new Date(2012, 2, 24, 9, 37, 0, 0), values: [{ value: 13.43 }, { value: 13.50 }, { value: 13.37 }, { value: 13.47 }, { value: 65763004 }] },
                            { timeStamp: new Date(2012, 2, 25, 9, 37, 0, 0), values: [{ value: 13.60 }, { value: 13.78 }, { value: 13.53 }, { value: 13.72 }, { value: 136154424 }] },
                            { timeStamp: new Date(2012, 2, 26, 9, 37, 0, 0), values: [{ value: 13.79 }, { value: 13.88 }, { value: 13.54 }, { value: 13.61 }, { value: 119233696 }] },
                            { timeStamp: new Date(2012, 2, 27, 9, 37, 0, 0), values: [{ value: 13.63 }, { value: 13.72 }, { value: 13.45 }, { value: 13.48 }, { value: 87742979 }] },
                            { timeStamp: new Date(2012, 2, 28, 9, 37, 0, 0), values: [{ value: 13.50 }, { value: 13.59 }, { value: 13.43 }, { value: 13.49 }, { value: 63352850 }] },
                            { timeStamp: new Date(2012, 2, 29, 9, 37, 0, 0), values: [{ value: 13.40 }, { value: 13.58 }, { value: 13.31 }, { value: 13.47 }, { value: 100578453 }] },
                            { timeStamp: new Date(2012, 2, 30, 9, 37, 0, 0), values: [{ value: 13.61 }, { value: 13.64 }, { value: 13.21 }, { value: 13.27 }, { value: 124675884 }] },
                            { timeStamp: new Date(2012, 2, 31, 9, 37, 0, 0), values: [{ value: 13.16 }, { value: 13.26 }, { value: 13.07 }, { value: 13.13 }, { value: 115641585 }] }],
                                    limits: {
                                        time: {
                                            minValueIndex: 40,
                                            minValue: null,
                                            maxValueIndex: 200,
                                            maxValue: null
                                        },
                                        value: {
                                            minValueIndex: null,
                                            minValue: null,
                                            maxValueIndex: null,
                                            maxValue: null
                                        }
                                    },
                                    layers: [{
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.candlestick,
                                            settings: {
                                                draw: {
                                                    colorBear: '255, 0, 0',
                                                    colorBull: '0, 255, 0',
                                                    width: 0.5      // (px)
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                },
                                                indication: {
                                                    font: 'normal 11px AramidBook',
                                                    color: '0, 0, 0'
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 0
                                            }, {
                                                key: 1
                                            }, {
                                                key: 2
                                            }, {
                                                key: 3,
                                                indication: true
                                            }]
                                        }
                                    }]
                                }
                                ,
                                {
                                    inputs: [
                                    {
                                        name: 'point1',
                                        value: {
                                            price: 12.10,
                                            timeStamp: new Date(2012, 1, 13, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point2',
                                        value: {
                                            price: 12.40,
                                            timeStamp: new Date(2012, 1, 6, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point3',
                                        value: {
                                            price: 13.18,
                                            timeStamp: new Date(2012, 1, 2, 9, 37, 0, 0)
                                        }
                                    },
                                    {
                                        name: 'point4',
                                        value: {
                                            price: 13.69,
                                            timeStamp: new Date(2012, 1, 10, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point5',
                                        value: {
                                            price: 13.69,
                                            timeStamp: new Date(2012, 1, 23, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point6',
                                        value: {
                                            price: 13.18,
                                            timeStamp: new Date(2012, 2, 3, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point7',
                                        value: {
                                            price: 12.40,
                                            timeStamp: new Date(2012, 1, 27, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point8',
                                        value: {
                                            price: 12.10,
                                            timeStamp: new Date(2012, 1, 21, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point9',
                                        value: {
                                            price: 13.15,
                                            timeStamp: new Date(2012, 1, 8, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point10',
                                        value: {
                                            price: 13.15,
                                            timeStamp: new Date(2012, 1, 11, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point11',
                                        value: {
                                            price: 13.15,
                                            timeStamp: new Date(2012, 2, 1, 9, 37, 0, 0)
                                        }
                                    }, {
                                        name: 'point12',
                                        value: {
                                            price: 13.15,
                                            timeStamp: new Date(2012, 2, 4, 9, 37, 0, 0)
                                        }
                                    }],
                                    definesScaling: false,
                                    data: [],
                                    layers: [
                                    {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 0
                                            }, {
                                                key: 1
                                            }]
                                        }
                                    },
                                    {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 1
                                            }, {
                                                key: 2
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 2
                                            }, {
                                                key: 3
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 3
                                            }, {
                                                key: 4
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 4
                                            }, {
                                                key: 5
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 5
                                            }, {
                                                key: 6
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 6
                                            }, {
                                                key: 7
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 7
                                            }, {
                                                key: 0
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 8
                                            }, {
                                                key: 9
                                            }]
                                        }
                                    }, {
                                        isSelected: false,
                                        chartType: {
                                            name: chartTypes.trendLine,
                                            settings: {
                                                draw: {
                                                    color: '255, 255, 0',
                                                    width: 3.5
                                                },
                                                selection: {
                                                    squareSide: 8,
                                                    color: '255, 255, 255',
                                                    width: 0.5
                                                }
                                            },
                                            dataPointDefinitions: [{
                                                key: 10
                                            }, {
                                                key: 11
                                            }]
                                        }
                                    }]
                                }
                            ]

                        }, {
                            position: 'left',
                            showHorizontalLines: false,
                            showLabels: true,
                            limits: 'auto',
                            scalingType: 'linear',
                            minMove: 0.01,
                            numberFormat: 3,
                            series: [{
                                data: [{ timeStamp: new Date(2012, 2, 10, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                    { timeStamp: new Date(2012, 2, 11, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                    { timeStamp: new Date(2012, 2, 12, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                    { timeStamp: new Date(2012, 2, 13, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                    { timeStamp: new Date(2012, 2, 14, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                    { timeStamp: new Date(2012, 2, 15, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                    { timeStamp: new Date(2012, 2, 16, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                    { timeStamp: new Date(2012, 2, 17, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                    { timeStamp: new Date(2012, 2, 18, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                    { timeStamp: new Date(2012, 2, 19, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                    { timeStamp: new Date(2012, 2, 20, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                    { timeStamp: new Date(2012, 2, 21, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] }],
                                limits: {
                                    time: {
                                        minValueIndex: 40,
                                        minValue: null,
                                        maxValueIndex: 200,
                                        maxValue: null
                                    },
                                    value: {
                                        minValueIndex: null,
                                        minValue: null,
                                        maxValueIndex: null,
                                        maxValue: null
                                    }
                                },
                                layers: [{
                                    isSelected: false,
                                    chartType: {
                                        name: chartTypes.line,
                                        settings: {
                                            draw: {
                                                color: '0, 255, 0',
                                                width: 0.5      // (px)
                                            },
                                            selection: {
                                                squareSide: 8,
                                                color: '255, 255, 255',
                                                width: 0.5
                                            },
                                            indication: {
                                                font: 'normal 11px AramidBook',
                                                color: '0, 0, 0'
                                            }
                                        }
                                        ,
                                        dataPointDefinitions: [{
                                            key: 3,
                                            indication: true
                                        }]
                                    }
                                }]
                            }]
                        }],
                        header: {
                            domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Hello World??</span></div>",
                            onRectChanged: function (rect) {
                            },
                            height: 30
                        }
                    }
                    //#endregion subgraph 1

                     //#region subgraph 2
                     //,{
                     //    realEstatePercentage: 1,
                     //    axes: [{
                     //        position: 'left',
                     //        showHorizontalLines: true,
                     //        showLabels: true,
                     //        limits: 'auto',
                     //        fixed: {
                     //            maxValue: 15.31,
                     //            minValue: 4.92
                     //        },
                     //        scalingType: 'linear',
                     //        minMove: 0.01,
                     //        numberFormat: 3,
                     //        series: [{
                     //            data: [{ timeStamp: new Date(2012, 7, 7, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                     //                { timeStamp: new Date(2012, 7, 9, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                     //                { timeStamp: new Date(2012, 7, 11, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                     //                { timeStamp: new Date(2012, 7, 16, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                     //                { timeStamp: new Date(2012, 7, 18, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                     //                { timeStamp: new Date(2012, 7, 19, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                     //                { timeStamp: new Date(2012, 7, 20, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                     //                { timeStamp: new Date(2012, 7, 21, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                     //                { timeStamp: new Date(2012, 7, 22, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                     //                { timeStamp: new Date(2012, 7, 23, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                     //                { timeStamp: new Date(2012, 7, 24, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                     //                { timeStamp: new Date(2012, 7, 25, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] }],
                     //            limits: {
                     //                time: {
                     //                    minValueIndex: 40,
                     //                    minValue: null,
                     //                    maxValueIndex: 200,
                     //                    maxValue: null
                     //                },
                     //                value: {
                     //                    minValueIndex: null,
                     //                    minValue: null,
                     //                    maxValueIndex: null,
                     //                    maxValue: null
                     //                }
                     //            },
                     //            layers: [{
                     //                isSelected: false,
                     //                chartType: {
                     //                    name: "line",
                     //                    settings: {
                     //                        draw: {
                     //                            color: '0, 255, 0',
                     //                            width: 0.5      // (px)
                     //                        },
                     //                        selection: {
                     //                            squareSide: 8,
                     //                            color: '255, 255, 255',
                     //                            width: 0.5
                     //                        },
                     //                        indication: {
                     //                            font: 'normal 11px AramidBook',
                     //                            color: '0, 0, 0'
                     //                        }
                     //                    },
                     //                    dataPointDefinitions: [{
                     //                        key: 3,
                     //                        indication: true
                     //                    }]
                     //                }
                     //            }]
                     //        }]
                     //    }
                     //    ],
                     //    header: {
                     //        domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Hello World??</span></div>",
                     //        onRectChanged: function (rect) {
                     //        },
                     //        height: 30
                     //    }
                     //}
                    ////#endregion subgraph 2
                ],
                style: {
                    backgroundColor: '#000',
                    axes: {
                        color: 'rgba(62, 65, 70,1)',
                        width: 1
                    },
                    label: {
                        color: 'rgba(235, 235, 235, 1)',
                        font: 'normal 11px AramidBook'
                    },
                    grid: {
                        intraDayColor: 'rgba(23, 26, 32, 1)',
                        horizontalColor: 'rgba(23, 26, 32, 1)',
                        noIntraDayColor: 'rgba(41, 45, 53, 1)',
                        width: 1
                    },
                    crosshair: {
                        draw: {
                            color: 'rgba(0, 255, 255, 1)',
                            width: 1
                        },
                        indication: {
                            color: 'rgba(0, 0, 0, 1)',
                            font: 'normal 11px AramidBook'
                        }
                    }
                },
                onViewPortLeftMarginChange: function (margin) {
                },
                onViewPortRightMarginChange: function (margin) {
                }
            });
            window.chart.xAxis().maximumNumberOfVisibleBars(21);
            //window.chart.xAxis().limits({ minValueIndex: 21, maxValueIndex: 70 });
            //debugger;
            //window.chart.xAxis().limits({ minValueIndex: 24, maxValueIndex: 67 });
        });
    });

