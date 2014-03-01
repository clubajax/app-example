define([
        'jquery',
        'plugins/statusLine/StatusSectionRenderer',
        'common/Utilities'
    ], function ($, SectionRenderer, utilities) {

    function StatusRendererHelper() {

    }

    var statusHolder = '<span style="display: inline-block"></span>';


    StatusRendererHelper.prototype = {
        init: function (object, $parent, settings) {

            object._$parent = $parent;

            object.sectionDefaults = function () {
                return settings.sectionDefaults;
            };

            object._$element = $(statusHolder).appendTo($parent);


            var changeCssText = function (newValue, oldValue) {
                var result = utilities.changeCssText(object._$element, newValue, oldValue);
                object._$element.css('display', 'inline-block');
                return result;
            };

            object.cssText = utilities.settingProperty(settings, 'cssText', changeCssText);

            var changeCssClass = function (newValue, oldValue) {
                var result = utilities.changeCssClass(object._$element, newValue, oldValue);
                object._$element.css('display', 'inline-block');
                return result;
            };

            object.cssClass = utilities.settingProperty(settings, 'cssClass', changeCssClass);

            //            var onStyleChanged = function (newStyle, oldStyle) {
            //                utilities.changeCssText(object._$element, newStyle && newStyle.cssText, oldStyle && oldStyle.cssText);
            //                utilities.changeCssClass(object._$element, newStyle && newStyle.cssClass, oldStyle && oldStyle.cssClass);
            //            };

            //            object.style = utilities.settingProperty(settings, 'style', onStyleChanged);

            object.onNumberOfSectionsChanged = settings.onNumberOfSectionsChanged;

            //init
            //onStyleChanged(settings.style);
            changeCssText(settings.cssText);
            changeCssClass(settings.cssClass);

            object.sections = utilities.settingArrayPropertyProxy(settings.sections,
                function (index, newSection) {
                    var $element = newSection._$element, anchor;
                    if (index < object._$element.children().length - 1) {
                        anchor = $($element.children()[index]);
                        $element.insertBefore(anchor);
                    } else {
                        object._$element.append($element);
                    }
                    if (object.onNumberOfSectionsChanged) {
                        object.onNumberOfSectionsChanged(settings.sections && settings.sections.length);
                    }
                    return newSection;
                },
                function (newSection, old) {
                    newSection._$element = old._$element;

                    old._$element = null;

                    old.dispose();

                    return newSection;
                },
                function (index, removed) {
                    var i, length = removed && removed.length, anchor;
                    for (i = 0; i < length; i++) {
                        anchor = $(object._$element.children()[index]);
                        anchor.remove();
                        removed[i].dispose();
                    }
                    if (object.onNumberOfSectionsChanged) {
                        object.onNumberOfSectionsChanged(settings.sections && settings.sections.length);
                    }
                },
                function (removed) {
                    var i, length = removed && removed.length;
                    for (i = 0; i < length; i++) {
                        removed[i].dispose();
                    }
                    object._$element.html('');
                    if (object.onNumberOfSectionsChanged) {
                        object.onNumberOfSectionsChanged(0);
                    }
                },
                function (setting) {
                    var result, id = utilities.idGenerator('status');
                    if (settings.sectionDefaults) {
                        setting = $.extend(true, $.extend({}, settings.sectionDefaults), setting);
                    }
                    result = new SectionRenderer(object._$element, setting);
                    result.id = id;
                    return result;
                },
                true);
        },


        dispose: function (object) {

            delete object.defaults;

            delete object.data;

            delete object._$element;
        }
    };

    var self = new StatusRendererHelper();

    return self;
});
