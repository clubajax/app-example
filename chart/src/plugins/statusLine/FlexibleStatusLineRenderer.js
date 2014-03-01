define(['plugins/statusline/FlexibleStatusLineRendererHelper'], function (statusLineRendererHelper) {

    function StatusLineRenderer(settings) {
        statusLineRendererHelper.init(this, settings);
    }

    StatusLineRenderer.prototype = {

        dispose: function () {
            statusLineRendererHelper.dispose(this);
        }
    };

    return StatusLineRenderer;
});