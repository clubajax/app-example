require([
        "../../../../../lib/domReady",
        "../../../../../lib/order!../../../../../lib/jquery.js"],
    function (domReady) {

        domReady(function () {

            requirejs.config({
                baseUrl: '../../../'
            });

            requirejs(["plugins/statusLine/StatusRenderer", "plugins/statusline/StatusSectionRenderer", "common/utilities"], function (StatusLineRenderer, statusLineSectionType, utilities) {

                var refrence = $('#reference'), container = $('#subgGrapBody');

                var settings = {
                    classes: {
                        scrollRight: 'ui-sl-scrollRight',
                        scrollLeft: 'ui-sl-scrollLeft'
                    },
                    sections: [{
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
                                text: 'pepe',
                                cssText: '',
                                cssClass: ''
                            },
                            label: {
                                text: 'lola',
                                cssText: '',
                                cssClass: ''
                            }
                        }, {
                            value: {
                                text: 'pepito',
                                cssText: '',
                                cssClass: ''
                            },
                            label: {
                                text: 'lolita',
                                cssText: '',
                                cssClass: ''
                            }
                        }]
                    }, {
                        type: statusLineSectionType.header,
                        classes: {
                            csvWrapper: undefined,
                            csvSeparator: undefined
                        },
                        defaults: {
                            csv: {
                                cssText: undefined,
                                cssClass: undefined
                            }
                        },
                        data: {
                            prefix: {
                                text: 'Mov Avg 1 Line',
                                cssText: undefined,
                                cssClass: undefined
                            },
                            csv: [{
                                text: 'Close',
                                cssText: undefined,
                                cssClass: undefined
                            }, {
                                text: '9',
                                cssText: undefined,
                                cssClass: undefined
                            }, {
                                text: '0',
                                cssText: undefined,
                                cssClass: undefined
                            }]
                        }
                    }, {
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
                    }]
                };

                var renderer = new StatusLineRenderer(settings);
                
                window.statusLineRenderer = renderer;

                container.append(renderer.domElement);

                //simulating a position change 
                renderer.rect({
                    top: refrence.position().top,
                    left: refrence.position().left,
                    bottom: refrence.height() + refrence.position().top,
                    right: refrence.width() + refrence.position().left
                });

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