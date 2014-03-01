require([
        "../../../../../lib/domReady",
        "../../../../../lib/order!../../../../../lib/jquery.js"],
    function (domReady) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../'
            });

            requirejs(["plugins/statusline/FlexibleStatusLineRenderer", "common/utilities"], function (StatusLineRenderer, utilities) {

                var refrence = $('#reference'), container = refrence; // $('#slContainer');

                var settings = {
                    style: {
                        domElement: {
                            cssText: undefined,
                            cssClass: 'ui-sl-body'
                        },
                        navigation: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollerBody'
                        },
                        scrollRight: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollRight'
                        },
                        scrollLeft: {
                            cssText: undefined,
                            cssClass: 'ui-sl-scrollLeft'
                        }
                    },
                    content: {
                        cssText: 'padding-left:10px',
                        sectionDefaults:
                            {
                                //cssClass: 'ui-sl-value-bear'
                            },
                        sections: [
                        {
                            cssClass: 'ui-sl-labelValueGroup',
                            cellDefaults: {
                                cssClass: 'ui-sl-label'
                            },
                            data: [
                                {
                                    data: 'Sect 0 D 0',
                                    cssText: 'color: gray',
                                    cssClass: ''
                                },
                            {
                                data: 'Sect 0 D 1',
                                cssText: 'color: violet',
                                cssClass: ''
                            }
                                , {
                                    data: 'Sect 0 D 2',
                                    cssText: 'color: blue',
                                    cssClass: ''
                                },
                                {
                                    data: 'Sect 0 D 3',
                                    cssText: 'color: orange',
                                    cssClass: ''
                                }
                            ]
                        },
                            {

                                cssClass: 'ui-sl-labelValueGroup',
                                cellDefaults: {
                                },
                                data: [
                                {
                                    data: 'Mov Avg 1 Line(Close, 9, 0)',
                                    cssText: '',
                                    cssClass: 'ui-sl-label'
                                },
                            {
                                data: '$10.23',
                                cssText: '',
                                cssClass: 'ui-sl-value-bull'
                            }
                            ]
                            }

                        ]
                    }
                };

                var renderer = new StatusLineRenderer(settings);

                window.statusLineRenderer = renderer;

                container.append($(renderer.domElement));

                window.more = function () {
                    window.statusLineRenderer.content.sections.push({
                        cssClass: 'ui-sl-labelValueGroup',
                        data: [
                                {
                                    data: 'Bollinger Bands(Close, 9, 0)',
                                    cssText: '',
                                    cssClass: 'ui-sl-label'
                                },
                            {
                                data: '$10.23',
                                cssText: '',
                                cssClass: 'ui-sl-value-bull'
                            },
                            {
                                data: '$11.23',
                                cssText: '',
                                cssClass: 'ui-sl-value-bull'
                            },
                            {
                                data: '$9.23',
                                cssText: '',
                                cssClass: 'ui-sl-value-bull'
                            }
                            ]
                    });

                    window.statusLineRenderer.content.sections(0).data.push({
                        data: '$12.23',
                        cssText: '',
                        cssClass: 'ui-sl-value-bear'
                    });

                    window.statusLineRenderer.content.sections(0).data.splice(0, 1);
                    window.statusLineRenderer.content.sections(0).data(0).data('Changed text');
                    window.statusLineRenderer.content.sections(0).data(0).cssText('background-color:red');
                };

                window.statuslineplugin_demo = {

                    //#region test change rect

                    rect_change: function () {

                        refrence.css('left', 120);
                        refrence.css('top', 300);
                        refrence.width(480 - 120);
                        refrence.height(330 - 300);

                        renderer.rect({
                            top: 300,
                            left: 120,
                            bottom: 330,
                            right: 480
                        });

                    },

                    //#endregion test change rect

                    //#region test for sections, update

                    sections_update: function () {
                        renderer.sections(1, {
                            type: statusLineSectionType.label_value,
                            classes: {
                                labelValueGroup: 'ui-sl-labelValueGroup'
                            },
                            defaults: {
                                value: {
                                    cssText: '',
                                    cssClass: ''
                                },
                                label: {
                                    cssText: '',
                                    cssClass: 'ui-sl-label'
                                }
                            },
                            data: [{
                                value: {
                                    text: 'rosa',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }, {
                                value: {
                                    text: 'rosita',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }]
                        });
                    },

                    //#endregion test for sections, update

                    //#region test for sections, splice

                    sections_splice: function () {
                        renderer.sections.splice(1, 2, {
                            type: statusLineSectionType.label_value,
                            classes: {
                                labelValueGroup: 'ui-sl-labelValueGroup'
                            },
                            defaults: {
                                value: {
                                    cssText: '',
                                    cssClass: ''
                                },
                                label: {
                                    cssText: '',
                                    cssClass: 'ui-sl-label'
                                }
                            },
                            data: [{
                                value: {
                                    text: 'rosa',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }, {
                                value: {
                                    text: 'rosita',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }]
                        });
                    },

                    //#endregion test for sections, splice

                    //#region test for sections, push

                    sections_push: function () {

                        renderer.sections.push({
                            type: statusLineSectionType.label_value,
                            classes: {
                                labelValueGroup: 'ui-sl-labelValueGroup'
                            },
                            defaults: {
                                value: {
                                    cssText: '',
                                    cssClass: ''
                                },
                                label: {
                                    cssText: '',
                                    cssClass: 'ui-sl-label'
                                }
                            },
                            data: [{
                                value: {
                                    text: 'rosa',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }, {
                                value: {
                                    text: 'rosita',
                                    cssText: '',
                                    cssClass: ''
                                }
                            }]
                        });
                    },

                    //#endregion test for sections, push

                    //#region test for labelValue section, replace data

                    labelValueSection_replaceData: function () {
                        renderer.sections(0).data([{
                            value: {
                                text: 'pepe',
                                cssText: 'color:#F00;',
                                cssClass: undefined
                            },
                            label: {
                                text: 'pepito',
                                cssText: undefined,
                                cssClass: undefined
                            }
                        }, {
                            value: {
                                text: 'lola',
                                cssText: undefined,
                                cssClass: undefined
                            },
                            label: {
                                text: 'lolita',
                                cssText: undefined,
                                cssClass: undefined
                            }
                        }, {
                            value: {
                                text: 'maria',
                                cssText: '',
                                cssClass: 'us-sl-value'
                            },
                            label: {
                                text: 'mariita',
                                cssText: '',
                                cssClass: ''
                            }
                        }]);
                    },

                    //#endregion test for labelValue section, replace data

                    //#region test for labelValue section, change defaults

                    labelValueSection_changeDefaults: function () {
                        renderer.sections(0).defaults({
                            value: {
                                cssText: '',
                                cssClass: ''
                            },
                            label: {
                                cssText: '',
                                cssClass: 'ui-sl-label2'
                            }
                        });
                    },

                    //#endregion test for labelValue section, change defaults

                    //#region test for labelValue section, spliceData, add

                    labelValueSection_spliceData_Add: function () {
                        renderer.sections(0).data.splice(1, 0, {
                            value: {
                                text: 'paco',
                                cssText: '',
                                cssClass: 'us-sl-value'
                            },
                            label: {
                                text: 'paquito',
                                cssText: 'text-decoration:line-through;',
                                cssClass: ''
                            }
                        });
                    },

                    //#endregion test for labelValue section, spliceData, add 

                    //#region test for labelValue section, spliceData, add and remove

                    labelValueSection_spliceData_AddRemove: function () {
                        renderer.sections(0).data.splice(1, 1, {
                            value: {
                                text: 'paco',
                                cssText: '',
                                cssClass: 'us-sl-value'
                            },
                            label: {
                                text: 'paquito',
                                cssText: 'text-decoration:line-through;',
                                cssClass: ''
                            }
                        });
                    },

                    //#endregion test for labelValue section, spliceData, add and remove

                    //#region test for header section, replace data

                    headerSection_replaceData: function () {
                        renderer.sections(1).data({
                            prefix: {
                                text: 'Mov Avg',
                                cssText: undefined,
                                cssClass: 'us-sl-prefix'
                            },
                            csv: [{
                                text: 'Close',
                                cssText: undefined,
                                cssClass: undefined
                            }, {
                                text: '4',
                                cssText: 'color:#00F;',
                                cssClass: undefined
                            }]
                        });
                    },

                    //#endregion test for header section, replace data

                    //#region test for header section, change defaults

                    headerSection_changeDefaults: function () {
                        renderer.sections(1).defaults({
                            csv: {
                                cssText: 'border: 1px #F00 dashed;',
                                cssClass: undefined
                            }
                        });
                    }

                    //#endregion test for header section, change defaults
                };
            });

        });
    });