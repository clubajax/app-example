define(
    [
    ], function () {

        function EventObject(pointers, changedPointers, button) {
            this.pointers = pointers;
            this.changedPointers = changedPointers;
            this.button = button;
        }

        return EventObject;

    }
);