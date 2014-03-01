define([], function () {
    //<summary>
    //  settings: {
    //  }
    //</summary>
    
    function RendererTarget(target, targetParent) {
        this.target = target;
        this.targetParent = targetParent || null;
    }

    return RendererTarget;
});