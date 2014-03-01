define([], function () {
    return function SubGraphSettings() {
        return {
            realEstatePercentage:1,
            axes:[],
            header:{
                domElement:'<div class="loadingoverlay"><div class="loading"></div></div>',
                onRectChanged:function (rect) {
                },
                height:20
            }
        };
    };
});
