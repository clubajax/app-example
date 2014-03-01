define(['common/Utilities'], function (utilities) {

    function ElementWrapperHelper() {

    }

    ElementWrapperHelper.prototype =
         {
             init: function (object, element, settings) {
                 object._$element = $(element);

                 var onDataChanged = function (newValue, oldValue) {
                     object._$element.html(newValue);
                 };

                 object.data = utilities.settingProperty(settings, 'data', onDataChanged);

                 var changeCssText = function (newValue, oldValue) {
                     var result = utilities.changeCssText(object._$element, newValue, oldValue);
                     //object._$element.css('display', 'inline-block');
                     return result;
                 };

                 object.cssText = utilities.settingProperty(settings, 'cssText', changeCssText);

                 var changeCssClass = function (newValue, oldValue) {
                     var result = utilities.changeCssClass(object._$element, newValue, oldValue);
                     //object._$element.css('display', 'inline-block');
                     return result;
                 };

                 object.cssClass = utilities.settingProperty(settings, 'cssClass', changeCssClass);

                 onDataChanged(settings.data);
                 changeCssText(settings.cssText);
                 changeCssClass(settings.cssClass);
             },

             dispose: function (object) {

                 delete object.data;

                 delete object.cssText;

                 delete object.cssClass;

                 object._$element.off();

                 object._$element.empty();

             }

         };

    var self = new ElementWrapperHelper();

    return self;
});