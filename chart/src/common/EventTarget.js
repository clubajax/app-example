define([], function () {

    function EventTarget(target, targetParent) {
        this.target = target;
        this.targetParent = targetParent;
    }

    return EventTarget;
});
