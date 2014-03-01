define(['plugins/statusline/StatusSectionRendererHelper'], function (helper) {

    function StatusSectionRenderer($parent, settings) {
        helper.init(this, $parent, settings);
    }

    StatusSectionRenderer.prototype = {
        dispose: function () {
            helper.dispose(this);
        }
    };

    return StatusSectionRenderer;
});