define([
        'jquery',
        'plugins/common/ElementWrapperRenderer',
        'common/Utilities'
    ], function ($, ElementWrapperRenderer, utilities) {

    function StatusSectionRendererHelper() {

    }

    var cellHolder = '<span></span>',
        sectionHolder = '<div></div>';


    StatusSectionRendererHelper.prototype = {
        init: function (object, $parent, settings) {

            object._$parent = $parent;

            object.cellDefaults = function () {
                return settings.cellDefaults;
            };

            object._$element = $(sectionHolder).appendTo($parent);


//            var onStyleChanged = function (newStyle, oldStyle) {
//                utilities.changeCssText(object._$element, newStyle && newStyle.cssText, oldStyle && oldStyle.cssText);
//                utilities.changeCssClass(object._$element, newStyle && newStyle.cssClass, oldStyle && oldStyle.cssClass);
//                object._$element.css('float', 'left');
//            };

            var changeCssText = function (newValue, oldValue) {
                var result = utilities.changeCssText(object._$element, newValue, oldValue);
                object._$element.css('float', 'left');
                //object._$element.css('display', 'inline-block');
                return result;
            };

            object.cssText = utilities.settingProperty(settings, 'cssText', changeCssText);

            var changeCssClass = function (newValue, oldValue) {
                var result = utilities.changeCssClass(object._$element, newValue, oldValue);
                object._$element.css('float', 'left');
                //object._$element.css('display', 'inline-block');
                return result;
            };

            object.cssClass = utilities.settingProperty(settings, 'cssClass', changeCssClass);

            //init
            //onStyleChanged(settings.style);
            changeCssText(settings.cssText);
            changeCssClass(settings.cssClass);

            object.data = utilities.settingArrayPropertyProxy(settings.data,
                function (index, newElementWrapper) {
                    var $element = newElementWrapper._$element, anchor;
                    if (index < object._$element.children().length - 1) {
                        anchor = $($element.children()[index]);
                        $element.insertBefore(anchor);
                    } else {
                        object._$element.append($element);
                    }

                    return newElementWrapper;
                },
                function (newElementWrapper, old) {
                    var $element = newElementWrapper._$element, anchor = $($element.children()[index]);

                    newElementWrapper._$element = old._$element;
                    newElementWrapper.cssText(newElementWrapper.cssText());
                    newElementWrapper.cssClass(newElementWrapper.cssClass());
                    newElementWrapper.data(newElementWrapper.data());

                    old._$element = null;

                    old.dispose();

                    return newElementWrapper;
                },
                function (index, removed) {
                    var i, length = removed.length, inst;
                    for (i = 0; i < length; i++) {
                        var anchor = $(object._$element.children()[index]);

                        anchor.remove();

                        removed[i].dispose();
                    }
                },
                function () {
                    object._$element.html('');
                },
                function (setting) {
                    var result, id = utilities.idGenerator('status');
                    if (settings.defaults) {
                        setting = $.extend(true, $.extend({}, settings.cellDefaults), setting);
                    }
                    result = new ElementWrapperRenderer($(cellHolder), setting);
                    result.id = id;
                    return result;
                },
                true);
        },


        dispose: function (object) {

            delete object.cellDefaults;

            delete object.data;

            delete object._$element;
        }
    };

    var self = new StatusSectionRendererHelper();

    return self;
});
