document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/underscore-min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/backbone-min.js"></script>');

if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.objectManager = {};

midgardCreate.objectManager.models = {};

midgardCreate.objectManager.init = function() {
    
};

midgardCreate.objectManager.getContainerProperties = function(objectContainer, emptyValues) {
    var containerProperties = {};

    jQuery.each(jQuery('[property]', objectContainer), function(index, objectProperty) {
        var objectProperty = jQuery(objectProperty);
        var propertyName = objectProperty.attr('property');

        if (emptyValues) {
            containerProperties[propertyName] = '';
            return;
        }

        containerProperties[propertyName] = objectProperty.html();
    });
    return containerProperties;
};

midgardCreate.objectManager.getInstanceForContainer = function(objectContainer) {
    var model = midgardCreate.objectManager.getModelForContainer(objectContainer);
    var properties = midgardCreate.objectManager.getContainerProperties(objectContainer, false);
    properties.id = objectContainer.attr('about');

    return new model(properties);
};

midgardCreate.objectManager.getModelForContainer = function(objectContainer) {
    var type = objectContainer.attr('typeof');

    if (typeof midgardCreate.objectManager.models[type] != 'undefined') {
        // We already have a model for this type
        return midgardCreate.objectManager.models[type];
    }

    // Parse the relevant properties from DOM
    var modelProperties = midgardCreate.objectManager.getContainerProperties(objectContainer, true);

    modelProperties.url = function() {
        var url = '/mgd:create/object/' + encodeURIComponent(type) + '/';
        if (this.id) {
            url += encodeURIComponent(this.id) + '/';
        }
        return url;
    }

    midgardCreate.objectManager.models[type] = Backbone.Model.extend(modelProperties);

    return midgardCreate.objectManager.models[type];
};
