define([
        'common/Utilities',
        'plugins/statusline/StatusRenderer',
        'common/Rect'
    ], function (utilities, StatusRenderer, rect) {


        function StatusLineRendererHelper() {

        }

        var divs = '<div></div>',
            statusLineCell = '<td></td>';


        StatusLineRendererHelper.prototype = {
            _createLayout: function (object) {
                //style allowed. Style "container"                   
                object._$domElement = $(divs);

                //no styling allowed.
                var $contentHost = $('<div id="contentHost" style="position: absolute; top: 0px; left:0px; width: 4000px; margin-left:5px"></div>');
                object._$contentHost = $contentHost;

                //allows styling but the current styles will be reset all the time (class="ui-sl-scrollerBody") 
                //Style "navigation"
                object._$navigation = $('<div id="navigation" style="position: absolute; left:0px; display:none; top:-1px" ></div>');

                //#region Navigation controls
                //doing a table to avoid position calculations with divs (probably the browser would do it more efficiently)
                //no styling predicted
                var $navigationTable = $('<table style="width: 100%; border-spacing: 0px"></table>').appendTo(object._$navigation),
                    $navigationRow = $('<tr></tr>').appendTo($navigationTable),
                    $navigationCell;

                //create the first cell (left scroller)
                $navigationCell = $(statusLineCell).appendTo($navigationRow);

                //styling allowed (class=' + settings.classes.scrollLeft + ') 
                //Style ='scrollLeft'
                object._$scrollLeft = $('<div id="scrollLeft"></div>').appendTo($navigationCell);

                //center of the table
                $navigationCell = $(statusLineCell).appendTo($navigationRow);
                $navigationCell.css('width', '100%');

                $navigationCell = $(statusLineCell).appendTo($navigationRow);

                //styling allowed (class=' + settings.classes.scrollRight + ') 
                //Style ='scrollRight'
                object._$scrollRight = $('<div id="scrollRight"></div>').appendTo($navigationCell);

                //#endregion

                object._$domElement.append($contentHost);
                object._$domElement.append(object._$navigation);

                object.domElement = object._$domElement.get(0);

                object._$domElement.on('mouseenter', function () {

                    self._showNavigation(object);

                });

                object._$domElement.on('mouseleave', function () {
                    self._hideNavigation(object);
                });

                object._$scrollRight.on('mouseenter', function (eventobject) {
                    self._showNavigation(object);

                    var scrolling = self._computeRightScrolling(object);



                    if (scrolling < 0) {

                        $contentHost.animate({
                            left: object.settings.rect.left
                        }, {
                            duration: Math.abs(inverseOftheScrollingSpeed * (object.settings.rect.left + scrolling)),
                            step: function (now) {
                                object.contentPhysicalRect.left = now;
                            },
                            complete: function () {
                                self._evaluateNavigation(object);
                            }
                        });
                    }
                });

                object._$scrollRight.on('mouseleave', function (eventobject) {

                    $contentHost.stop();
                });

                object._$scrollLeft.on('mouseenter', function (eventobject) {
                    self._showNavigation(object);

                    var scrolling = self._computeLeftScrolling(object);


                    if (scrolling > 0) {

                        $contentHost.animate({
                            left: $contentHost.position().left - scrolling
                        }, {
                            duration: inverseOftheScrollingSpeed * scrolling,
                            step: function (now) {
                                object.contentPhysicalRect.left = now;
                            },
                            complete: function () {
                                self._evaluateNavigation(object);
                            }
                        });
                    }
                });

                object._$scrollLeft.on('mouseleave', function (eventobject) {

                    $contentHost.stop();
                });
            },
            init: function (object, settings) {

                settings.sections = settings.sections || [];

                settings.rect = settings.rect || rect();

                object.settings = settings;

                object.contentPhysicalRect = rect();

                this._createLayout(object);

                var changeStyle = function (name, newStyle, oldStyle, seededStyle) {
                    var $element = object['_$' + name],
                        newStyleObject = newStyle && newStyle[name],
                        newStyleCssText = newStyleObject && newStyleObject.cssText,
                        newStyleCssClass = newStyleObject && newStyleObject.cssClass,
                        oldStyleObject = oldStyle && oldStyle[name],
                        oldStyleCssText = oldStyleObject && oldStyleObject.cssText,
                        oldStyleCssClass = oldStyleObject && oldStyleObject.cssClass,
                        prop;

                    utilities.changeCssClass($element, newStyleCssText, oldStyleCssText);
                    utilities.changeCssClass($element, newStyleCssClass, oldStyleCssClass);

                    if (seededStyle) {
                        for (prop in seededStyle) {
                            if (seededStyle.hasOwnProperty(prop)) {
                                $element.css(prop, seededStyle[prop]);
                            }
                        }
                    }
                };

                var onStyleChanged = function (newStyle, oldStyle) {
                    changeStyle('domElement', newStyle, oldStyle);

                    changeStyle('navigation', newStyle, oldStyle, {
                        position: 'absolute',
                        left: '0px',
                        top: '-1px'
                    });

                    changeStyle('scrollLeft', newStyle, oldStyle);

                    changeStyle('scrollRight', newStyle, oldStyle);

                };

                object.style = utilities.settingProperty(settings, 'style', onStyleChanged);

                onStyleChanged(settings.style);

                var onNumberOfSectionsChanged = function (numberOfSections) {
                    self.resize(object);
                };

                if (settings.onNumberOfSectionsChanged) {
                    settings.onNumberOfSectionsChanged = function (numberOfSections) {
                        settings.onNumberOfSectionsChanged(numberOfSections);
                        onNumberOfSectionsChanged(numberOfSections);
                    };
                } else {
                    settings.onNumberOfSectionsChanged = onNumberOfSectionsChanged;
                }

                object.content = new StatusRenderer(object._$contentHost, settings.content);

                //object._$domElement = $('<div class="ui-sl-body"></div>');

                //no sections now
                //object._sections = [];

                object.rect = utilities.settingProperty(settings, 'rect', function (value, previous) {
                    self.rect(object, value, previous);
                });


                if (object.settings.rect) {
                    this.rect(object, object.settings.rect);
                }

            },

            _computeLeftScrolling: function (object) {
                var $content = object._$contentHost.children(":first"),
                    $parent = object._$domElement.parent(),
                    sections = $content.children(),
                    rightest, width;

                rightest = $(sections[sections.length - 1]);

                width = rightest.position().left + rightest.width();

                return object._$contentHost.position().left + width - $parent.width() + 10;

                //return object._$contentHost.position().left + $content.width() + $content.position().left - $parent.width();
            },

            _computeRightScrolling: function (object) {
                var $content = object._$contentHost.children(":first"),
                    sections = $content.children(),
                    leftest;

                leftest = $(sections[0]);
                
                return object._$contentHost.position().left - leftest.position().left;
                //return object._$contentHost.position().left;
            },

            _enableLeftScroller: function (object) {

                if ($.browser.msie) {
                    object._$scrollLeft.get(0).style.cssText += 'filter: alpha(opacity=100);';
                } else {
                    object._$scrollLeft.css('opacity', '1');
                }
            },

            _disableLeftScroller: function (object) {

                if ($.browser.msie) {
                    object._$scrollLeft.get(0).style.cssText += 'filter: alpha(opacity=50);';
                } else {
                    object._$scrollLeft.css('opacity', '0.5');
                }
            },

            _enableRightScroller: function (object) {

                if ($.browser.msie) {
                    object._$scrollRight.get(0).style.cssText += 'filter: alpha(opacity=100);';
                } else {
                    object._$scrollRight.css('opacity', '1');
                }
            },

            _disableRightScroller: function (object) {

                if ($.browser.msie) {
                    object._$scrollRight.get(0).style.cssText += 'filter: alpha(opacity=50);';
                } else {
                    object._$scrollRight.css('opacity', '0.5');
                }
            },

            _evaluateNavigation: function (object) {

                var result = false;

                if (self._computeLeftScrolling(object) > 0) {
                    self._enableLeftScroller(object);
                    result = true;
                } else {
                    self._disableLeftScroller(object);
                }

                if (self._computeRightScrolling(object) < 0) {
                    result = true;
                    self._enableRightScroller(object);
                } else {
                    self._disableRightScroller(object);
                }

                return result;
            },

            _showNavigation: function (object) {
                if (self._evaluateNavigation(object)) {

                    object._$navigation.show();

                    if ($.browser.msie) {
                        object._$contentHost.get(0).style.cssText += 'filter: alpha(opacity=250);';
                    } else {
                        object._$contentHost.css('opacity', '0.5');
                    }
                }
            },

            _hideNavigation: function (object) {

                object._$navigation.hide();

                if ($.browser.msie) {
                    object._$contentHost.get(0).style.cssText += 'filter: alpha(opacity=100);';
                } else {
                    object._$contentHost.css('opacity', '1');
                }

            },

            resize: function (object) {
                var $parent = object._$domElement.parent(),
                    scrolling;
                if ($parent.length > 0) {
                    //calculate how much is scrolled to the left
                    scrolling = self._computeLeftScrolling(object);
                    //if it is scrolled to the left but it fits
                    if (scrolling < 0) {
                        object._$contentHost.position().left = 0;
                    }
                }
            },

            rect: function (object /*, iRect, previousRect*/) {

                self.resize(object);
            },



            dispose: function (object) {

                object.rect = null;

                object.content.dispose();

                object.content = null;

                object._$domElement.off();
                object._$scrollRight.off();
                object._$scrollLeft.off();
                object._$navigation.off();
                object._$contentHost.off();

                object._$domElement.remove();
                object._$scrollRight.remove();
                object._$scrollLeft.remove();
                object._$navigation.remove();
                object._$contentHost.remove();

                object._$domElement = null;
                object._$scrollRight = null;
                object._$scrollLeft = null;
                object._$navigation = null;
                object._$contentHost = null;

            }
        };

        var inverseOftheScrollingSpeed = 20, // s/px
                self = new StatusLineRendererHelper();

        return self;
    });