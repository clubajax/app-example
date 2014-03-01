define(['plugins/common/ElementWrapperRendererHelper'], function (helper) {

    function ElementWrapper(element, settings) {
        helper.init(this, element, settings);
    }

    ElementWrapper.prototype = {
        dispose: function () {
            helper.dispose(this);
        }
    };

    return ElementWrapper;
});