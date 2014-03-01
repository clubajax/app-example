require([
        "../../../../../lib/domReady",
        "../../../../../lib/jquery.js"
    ],
    function (domReady, jquery) {

        domReady(function() {

            requirejs.config({
                baseUrl: '../../../../../',
                paths: {
                    'chart': './src/chart',
                    'plugins': './src/plugins',
                    'common': './src/common',
                    'i18n': './lib/i18n'
                }
            });


            requirejs([
                    "chart/chart",
                    "chart/SeriePainters/SeriePainterFactory",
                    "plugins/resourceManager/ResourceManager",
                    "plugins/interaction/Broker/Broker",
                    "common/userInteractionTypes",
                    "plugins/interaction/selection/selection",
                    "plugins/interaction/datatip/datatip",
                    "common/utilities",
                    "plugins/interaction/crosshair/crosshair"
                ],
                function (Chart, seriePainterFactory, resourceMananger, Broker, userInteractionTypes, Selection, Datatip, utilities, Crosshair) {

                    var $container = $('#parent'),
                        broker = new Broker();

                    //broker.pluginsStack.push(new Selection());
                    //broker.pluginsStack.push(new DragAndDrop());

                    function getLocaleShortDateString(d)
                    {
                        var f={"ar-SA":"dd/MM/yy","bg-BG":"dd.M.yyyy","ca-ES":"dd/MM/yyyy","zh-TW":"yyyy/M/d","cs-CZ":"d.M.yyyy","da-DK":"dd-MM-yyyy","de-DE":"dd.MM.yyyy","el-GR":"d/M/yyyy","en-US":"M/d/yyyy","fi-FI":"d.M.yyyy","fr-FR":"dd/MM/yyyy","he-IL":"dd/MM/yyyy","hu-HU":"yyyy. MM. dd.","is-IS":"d.M.yyyy","it-IT":"dd/MM/yyyy","ja-JP":"yyyy/MM/dd","ko-KR":"yyyy-MM-dd","nl-NL":"d-M-yyyy","nb-NO":"dd.MM.yyyy","pl-PL":"yyyy-MM-dd","pt-BR":"d/M/yyyy","ro-RO":"dd.MM.yyyy","ru-RU":"dd.MM.yyyy","hr-HR":"d.M.yyyy","sk-SK":"d. M. yyyy","sq-AL":"yyyy-MM-dd","sv-SE":"yyyy-MM-dd","th-TH":"d/M/yyyy","tr-TR":"dd.MM.yyyy","ur-PK":"dd/MM/yyyy","id-ID":"dd/MM/yyyy","uk-UA":"dd.MM.yyyy","be-BY":"dd.MM.yyyy","sl-SI":"d.M.yyyy","et-EE":"d.MM.yyyy","lv-LV":"yyyy.MM.dd.","lt-LT":"yyyy.MM.dd","fa-IR":"MM/dd/yyyy","vi-VN":"dd/MM/yyyy","hy-AM":"dd.MM.yyyy","az-Latn-AZ":"dd.MM.yyyy","eu-ES":"yyyy/MM/dd","mk-MK":"dd.MM.yyyy","af-ZA":"yyyy/MM/dd","ka-GE":"dd.MM.yyyy","fo-FO":"dd-MM-yyyy","hi-IN":"dd-MM-yyyy","ms-MY":"dd/MM/yyyy","kk-KZ":"dd.MM.yyyy","ky-KG":"dd.MM.yy","sw-KE":"M/d/yyyy","uz-Latn-UZ":"dd/MM yyyy","tt-RU":"dd.MM.yyyy","pa-IN":"dd-MM-yy","gu-IN":"dd-MM-yy","ta-IN":"dd-MM-yyyy","te-IN":"dd-MM-yy","kn-IN":"dd-MM-yy","mr-IN":"dd-MM-yyyy","sa-IN":"dd-MM-yyyy","mn-MN":"yy.MM.dd","gl-ES":"dd/MM/yy","kok-IN":"dd-MM-yyyy","syr-SY":"dd/MM/yyyy","dv-MV":"dd/MM/yy","ar-IQ":"dd/MM/yyyy","zh-CN":"yyyy/M/d","de-CH":"dd.MM.yyyy","en-GB":"dd/MM/yyyy","es-MX":"dd/MM/yyyy","fr-BE":"d/MM/yyyy","it-CH":"dd.MM.yyyy","nl-BE":"d/MM/yyyy","nn-NO":"dd.MM.yyyy","pt-PT":"dd-MM-yyyy","sr-Latn-CS":"d.M.yyyy","sv-FI":"d.M.yyyy","az-Cyrl-AZ":"dd.MM.yyyy","ms-BN":"dd/MM/yyyy","uz-Cyrl-UZ":"dd.MM.yyyy","ar-EG":"dd/MM/yyyy","zh-HK":"d/M/yyyy","de-AT":"dd.MM.yyyy","en-AU":"d/MM/yyyy","es-ES":"dd/MM/yyyy","fr-CA":"yyyy-MM-dd","sr-Cyrl-CS":"d.M.yyyy","ar-LY":"dd/MM/yyyy","zh-SG":"d/M/yyyy","de-LU":"dd.MM.yyyy","en-CA":"dd/MM/yyyy","es-GT":"dd/MM/yyyy","fr-CH":"dd.MM.yyyy","ar-DZ":"dd-MM-yyyy","zh-MO":"d/M/yyyy","de-LI":"dd.MM.yyyy","en-NZ":"d/MM/yyyy","es-CR":"dd/MM/yyyy","fr-LU":"dd/MM/yyyy","ar-MA":"dd-MM-yyyy","en-IE":"dd/MM/yyyy","es-PA":"MM/dd/yyyy","fr-MC":"dd/MM/yyyy","ar-TN":"dd-MM-yyyy","en-ZA":"yyyy/MM/dd","es-DO":"dd/MM/yyyy","ar-OM":"dd/MM/yyyy","en-JM":"dd/MM/yyyy","es-VE":"dd/MM/yyyy","ar-YE":"dd/MM/yyyy","en-029":"MM/dd/yyyy","es-CO":"dd/MM/yyyy","ar-SY":"dd/MM/yyyy","en-BZ":"dd/MM/yyyy","es-PE":"dd/MM/yyyy","ar-JO":"dd/MM/yyyy","en-TT":"dd/MM/yyyy","es-AR":"dd/MM/yyyy","ar-LB":"dd/MM/yyyy","en-ZW":"M/d/yyyy","es-EC":"dd/MM/yyyy","ar-KW":"dd/MM/yyyy","en-PH":"M/d/yyyy","es-CL":"dd-MM-yyyy","ar-AE":"dd/MM/yyyy","es-UY":"dd/MM/yyyy","ar-BH":"dd/MM/yyyy","es-PY":"dd/MM/yyyy","ar-QA":"dd/MM/yyyy","es-BO":"dd/MM/yyyy","es-SV":"dd/MM/yyyy","es-HN":"dd/MM/yyyy","es-NI":"dd/MM/yyyy","es-PR":"dd/MM/yyyy","am-ET":"d/M/yyyy","tzm-Latn-DZ":"dd-MM-yyyy","iu-Latn-CA":"d/MM/yyyy","sma-NO":"dd.MM.yyyy","mn-Mong-CN":"yyyy/M/d","gd-GB":"dd/MM/yyyy","en-MY":"d/M/yyyy","prs-AF":"dd/MM/yy","bn-BD":"dd-MM-yy","wo-SN":"dd/MM/yyyy","rw-RW":"M/d/yyyy","qut-GT":"dd/MM/yyyy","sah-RU":"MM.dd.yyyy","gsw-FR":"dd/MM/yyyy","co-FR":"dd/MM/yyyy","oc-FR":"dd/MM/yyyy","mi-NZ":"dd/MM/yyyy","ga-IE":"dd/MM/yyyy","se-SE":"yyyy-MM-dd","br-FR":"dd/MM/yyyy","smn-FI":"d.M.yyyy","moh-CA":"M/d/yyyy","arn-CL":"dd-MM-yyyy","ii-CN":"yyyy/M/d","dsb-DE":"d. M. yyyy","ig-NG":"d/M/yyyy","kl-GL":"dd-MM-yyyy","lb-LU":"dd/MM/yyyy","ba-RU":"dd.MM.yy","nso-ZA":"yyyy/MM/dd","quz-BO":"dd/MM/yyyy","yo-NG":"d/M/yyyy","ha-Latn-NG":"d/M/yyyy","fil-PH":"M/d/yyyy","ps-AF":"dd/MM/yy","fy-NL":"d-M-yyyy","ne-NP":"M/d/yyyy","se-NO":"dd.MM.yyyy","iu-Cans-CA":"d/M/yyyy","sr-Latn-RS":"d.M.yyyy","si-LK":"yyyy-MM-dd","sr-Cyrl-RS":"d.M.yyyy","lo-LA":"dd/MM/yyyy","km-KH":"yyyy-MM-dd","cy-GB":"dd/MM/yyyy","bo-CN":"yyyy/M/d","sms-FI":"d.M.yyyy","as-IN":"dd-MM-yyyy","ml-IN":"dd-MM-yy","en-IN":"dd-MM-yyyy","or-IN":"dd-MM-yy","bn-IN":"dd-MM-yy","tk-TM":"dd.MM.yy","bs-Latn-BA":"d.M.yyyy","mt-MT":"dd/MM/yyyy","sr-Cyrl-ME":"d.M.yyyy","se-FI":"d.M.yyyy","zu-ZA":"yyyy/MM/dd","xh-ZA":"yyyy/MM/dd","tn-ZA":"yyyy/MM/dd","hsb-DE":"d. M. yyyy","bs-Cyrl-BA":"d.M.yyyy","tg-Cyrl-TJ":"dd.MM.yy","sr-Latn-BA":"d.M.yyyy","smj-NO":"dd.MM.yyyy","rm-CH":"dd/MM/yyyy","smj-SE":"yyyy-MM-dd","quz-EC":"dd/MM/yyyy","quz-PE":"dd/MM/yyyy","hr-BA":"d.M.yyyy.","sr-Latn-ME":"d.M.yyyy","sma-SE":"yyyy-MM-dd","en-SG":"d/M/yyyy","ug-CN":"yyyy-M-d","sr-Cyrl-BA":"d.M.yyyy","es-US":"M/d/yyyy"};

                        var l=navigator.language?navigator.language:navigator['userLanguage'],y=d.getFullYear(),m=d.getMonth()+1,d=d.getDate();
                        f=(l in f)?f[l]:"MM/dd/yyyy";
                        function z(s){s=''+s;return s.length>1?s:'0'+s;}
                        f=f.replace(/yyyy/,y);f=f.replace(/yy/,String(y).substr(2));
                        f=f.replace(/MM/,z(m));f=f.replace(/M/,m);
                        f=f.replace(/dd/,z(d));f=f.replace(/d/,d);
                        return f;
                    }

                    var getDataTipSettings = function(graph) {
                        var result = {
                            style: {
                                domElement: {
                                    cssText: 'z-index:30000',//'z-index:27998',
                                    cssClass: 'ui-dt-host'
                                },
                                table: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-table'
                                },
                                fields: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-field'
                                },
                                symbols: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-symbol'
                                },
                                crosshairValues: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-crosshair'
                                },
                                data: {
                                    cssText: undefined,
                                    cssClass: 'ui-dt-data'
                                }
                            },
                            time: {
                                cssText: undefined,
                                cssClass: 'ui-dt-time',
                                formatter: function (time) {
                                    var result = '';
                                    if (time) {
                                        result = getLocaleShortDateString(time);
                                    }
                                    return result;
                                }
                            },
                            fields: [{
                                    data: 'Open',
                                    cssText: undefined,
                                    cssClass: undefined,
                                    visible: true
                                }, {
                                    data: 'High',
                                    cssText: undefined,
                                    cssClass: undefined,
                                    visible: true
                                }, {
                                    data: 'Low',
                                    cssText: undefined,
                                    cssClass: undefined,
                                    visible: true
                                }, {
                                    data: 'Close',
                                    cssText: undefined,
                                    cssClass: undefined,
                                    visible: true
                                }, {
                                    data: 'Volume',
                                    cssText: undefined,
                                    cssClass: undefined,
                                    visible: graph > 0
                                }],
                            symbols: [{
                                data: 'C',
                                cssText: undefined,
                                cssClass: undefined,
                                visible: true
                            }],
                            crosshairValues: [{
                                data: '',
                                cssClass: undefined
                            }]
                        };

                        if (graph === 0) {
                            result.data =
                                [
                                    [{
                                        graph: 0,
                                        axis: 0,
                                        serie: 0,
                                        key: 0
                                    },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 1
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 2
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 3
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 4,
                                            formatter : utilities.getFormatter(2)
                                        }]
                                    
                                ];
                            //result.symbols.push({
                            //    data: 'BAC',
                            //    cssText: undefined,
                            //    cssClass: undefined,
                            //    visible: graph === 0
                            //});
                            //result.crosshairValues.push({
                            //    data: '',
                            //    cssClass: undefined
                            //});
                            //result.data =
                            //    [
                            //        [{
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 0,
                            //                key: 0
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 0,
                            //                key: 1
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 0,
                            //                key: 2
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 0,
                            //                key: 3
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 0,
                            //                key: 4
                            //            }],
                            //        [{
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 1,
                            //                key: 0
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 1,
                            //                key: 1
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 1,
                            //                key: 2
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 1,
                            //                key: 3
                            //            },
                            //            {
                            //                graph: 0,
                            //                axis: 0,
                            //                serie: 1,
                            //                key: 4
                            //            }]
                            //    ];
                        } else {
                            result.data =
                                [
                                    [{
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 0
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 1
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 2
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 3
                                        },
                                        {
                                            graph: 0,
                                            axis: 0,
                                            serie: 0,
                                            key: 4,
                                            formatter: utilities.getFormatter(2)
                                        }]
                                ];
                        }
                        return result;
                    };


                    //broker.pluginsStack.push(new Selection());
                    //broker.pluginsStack.push(new Datatip(
                    //    {
                    //        //parent: $('body'),
                    //        //parent: $('#docked'),
                    //        alwaysEnabled : false,
                    //        forwardEvent : true,
                    //        onRetrieveSettings: getDataTipSettings
                    //    }));
                    //broker.pluginsStack.push(new Crosshair());
                    
                    window.chart = new Chart($container, {
                        painterFactory: seriePainterFactory,
                        resourceManager: resourceMananger,
                        userInteractionType: userInteractionTypes.desktop,
                        onEventCallback: function (eventType, eventObject) {

                            console.log('onEventCallback: ' + eventType);

                            return broker.onEventCallback(eventType, eventObject);
                        },
                        xAxis: {
                            limits: 'auto',
                            maximumNumberOfVisibleBars: 60,
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
                                        //fixed: {
                                        //    maxValue: 15.31,
                                        //    minValue: 4.92
                                        //},
                                        scalingType: 'linear',
                                        minMove: 0.01,
                                        numberFormat: 3,
                                        series: [{
                                            data: [{ timeStamp: new Date(2012, 7, 7, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                                { timeStamp: new Date(2012, 7, 9, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 11, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                                { timeStamp: new Date(2012, 7, 16, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 18, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 19, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 20, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                                { timeStamp: new Date(2012, 7, 21, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 22, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                                { timeStamp: new Date(2012, 7, 23, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 24, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 25, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] }],
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
                                                        name: "candlestick",
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
                                                                fontColor: '0,0,0'
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
                                                },
                                                {
                                                    isSelected: false,
                                                    chartType: {
                                                        name: "line",
                                                        settings: {
                                                            draw: {
                                                                color: '255, 128, 128',
                                                                width: 0.5      // (px)
                                                            },
                                                            selection: {
                                                                squareSide: 8,
                                                                color: '255, 255, 255',
                                                                width: 0.5
                                                            },
                                                            indication: {
                                                                fontColor: '0,0,0'
                                                            }
                                                        },
                                                        dataPointDefinitions: [{
                                                            key: 0,
                                                            indication: true
                                                        }]
                                                    }
                                                }]
                                        }]
                                    }
                                ],
                                header: {
                                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Hello World??</span></div>",
                                    onRectChanged: function(rect) {
                                    },
                                    height: 30
                                }
                            }
                            //#endregion subgraph 1
                            //#region subgraph 2
                            , {
                                realEstatePercentage: 1,
                                axes: [{
                                        position: 'left',
                                        showHorizontalLines: true,
                                        showLabels: true,
                                        limits: 'auto',
                                        //fixed: {
                                        //    maxValue: 15.31,
                                        //    minValue: 4.92
                                        //},
                                        scalingType: 'linear',
                                        minMove: 0.01,
                                        numberFormat: 3,
                                        series: [{
                                            data: [{ timeStamp: new Date(2012, 7, 7, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                                { timeStamp: new Date(2012, 7, 9, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 11, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                                { timeStamp: new Date(2012, 7, 16, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 18, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 19, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 20, 9, 37, 0, 0), values: [{ value: 11.79 }, { value: 11.86 }, { value: 11.63 }, { value: 11.64 }, { value: 132238785 }] },
                                                { timeStamp: new Date(2012, 7, 21, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] },
                                                { timeStamp: new Date(2012, 7, 22, 9, 37, 0, 0), values: [{ value: 11.61 }, { value: 12.07 }, { value: 11.60 }, { value: 12.00 }, { value: 235158078 }] },
                                                { timeStamp: new Date(2012, 7, 23, 9, 37, 0, 0), values: [{ value: 12.36 }, { value: 11.69 }, { value: 12.25 }, { value: 12.25 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 24, 9, 37, 0, 0), values: [{ value: 12.26 }, { value: 12.69 }, { value: 12.25 }, { value: 12.65 }, { value: 328638931 }] },
                                                { timeStamp: new Date(2012, 7, 25, 9, 37, 0, 0), values: [{ value: 11.83 }, { value: 11.87 }, { value: 11.50 }, { value: 11.57 }, { value: 215071520 }] }],
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
                                                    name: "line",
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
                                                            fontColor: '0,0,0'
                                                        }
                                                    },
                                                    dataPointDefinitions: [{
                                                        key: 3,
                                                        indication: true
                                                    }]
                                                }
                                            }]
                                        }]
                                    }
                                ],
                                header: {
                                    domElement: "<div style='width:100%; text-align:center;font-size: 30px'><span style='color: blue'>Hello World??</span></div>",
                                    onRectChanged: function(rect) {
                                    },
                                    height: 30
                                }
                            }
                            //#endregion subgraph 2
                        ],

                        onViewPortLeftMarginChange: function(margin) {
                        },
                        onViewPortRightMarginChange: function(margin) {
                        }
                    });

                });
        });

    });
