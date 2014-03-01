define(['i18n!./nls/resource'], function (resource) {
    function ResourceManager() {}
    ResourceManager.prototype = {
        getResource: function (resourceKey) {
            return resource[resourceKey];
        }
    };
    return new ResourceManager();
});
