define(['plugins/statusline/StatusRendererHelper'], function (helper) {

    function StatusRenderer($parent, settings) {
        helper.init(this, $parent, settings);
    }

    StatusRenderer.prototype = {
        dispose: function () {
            helper.dispose(this);
        }
    };

    return StatusRenderer;
});