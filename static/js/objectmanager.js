document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/underscore-min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/backbone-min.js"></script>');

if (typeof midgardCreate === 'undefined') {
    midgardCreate = {};
}

midgardCreate.objectManager = {
    models: {},
    views: {},

    init: function() {
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;
    },

    getContainerProperties: function(objectContainer, emptyValues) {
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
    },

    getTypeForContainer: function(objectContainer) {
        var objectContainer = jQuery(objectContainer);

        if (typeof objectContainer.attr('typeof') !== 'undefined')
        {
            // Direct match with container
            return objectContainer.attr('typeof');
        }
        return objectContainer.find('[typeof]').attr('typeof');
    },

    getIdentifierForContainer: function(objectContainer) {
        var objectContainer = jQuery(objectContainer);

        if (typeof objectContainer.attr('about') !== 'undefined')
        {
            // Direct match with container
            return objectContainer.attr('about');
        }
        return objectContainer.find('[about]').attr('about');
    },

    getCleanContainer: function(objectContainer) {
        var objectContainer = jQuery(objectContainer).clone(false);

        if (typeof objectContainer.attr('about') !== 'undefined')
        {
            // Direct match with container
            objectContainer.attr('about', '');
        }
        objectContainer.find('[about]').attr('about', '');
        objectContainer.find('[property]').html('');

        return objectContainer;
    },

    getViewForContainer: function(objectContainer) {
        var objectContainer = jQuery(objectContainer);
        var type = midgardCreate.objectManager.getTypeForContainer(objectContainer);

        if (typeof midgardCreate.objectManager.views[type] !== 'undefined') {
            // We already have a view for this type
            return midgardCreate.objectManager.views[type];
        }

        var viewProperties = {};
        viewProperties.initialize = function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        };
        viewProperties.tagName = objectContainer.get(0).nodeName;
        viewProperties.make = function(tagName, attributes, content) { 
            return midgardCreate.objectManager.getCleanContainer(objectContainer);
        };
        viewProperties.render = function() {
            var model = this.model;
            jQuery('[property]', this.el).each(function(index, propertyElement) {
                var propertyElement = jQuery(propertyElement);
                var property = propertyElement.attr('property');
                propertyElement.html(model.get(property));
            });

            if (   typeof model.collection !== 'undefined'
                && model.collection.urlpattern
                && model.id) {
                jQuery('a[rel="bookmark"]', this.el).each(function(index, linkElement) {
                    var linkElement = jQuery(linkElement);
                    linkElement.attr('href', model.collection.urlpattern.replace('GUID', model.id.replace('urn:uuid:', '')));
                });
            }
            return this;
        };

        midgardCreate.objectManager.views[type] = Backbone.View.extend(viewProperties);

        return midgardCreate.objectManager.views[type];
    }
};

midgardCreate.objectManager.getModelForContainer = function(objectContainer) {
    var type = midgardCreate.objectManager.getTypeForContainer(objectContainer);

    if (typeof midgardCreate.objectManager.models[type] !== 'undefined') {
        // We already have a model for this type
        return midgardCreate.objectManager.models[type];
    }

    // Parse the relevant properties from DOM
    var modelPropertiesFromRdf = midgardCreate.objectManager.getContainerProperties(objectContainer, true);
    var modelProperties = jQuery.extend({}, modelPropertiesFromRdf);

    modelProperties.url = function() {
        var url = '/mgd:create/object/' + encodeURIComponent(type) + '/';
        if (this.id) {
            url += encodeURIComponent(this.id) + '/';
        }
        return url;
    };

    modelProperties.getPlaceholder = function(propertyName) {
        return '&lt;' + propertyName + '&gt;';
    };

    modelProperties.initialize = function() {
        var modelInstance = this;
        var populateProperties = {};
        jQuery.each(modelPropertiesFromRdf, function(propName, propValue) {

            if (!modelInstance.get(propName)) {
                populateProperties[propName] = modelInstance.getPlaceholder(propName);
            }

        });
        if (!jQuery.isEmptyObject(populateProperties)) {
            modelInstance.set(populateProperties);
        }
    };

    modelProperties.runWorkflow = function(workflow, callback) {
        var url = '/mgd:create/run/' + encodeURIComponent(type) + '/' + encodeURIComponent(this.id) + '/' + workflow;
        that = this;
        jQuery.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                if (data === null) {
                    return;
                }
                callback(data);
            }
        });
    };

    modelProperties.getWorkflowState = function(callback) {
        var workflowState = {
            label: 'item',
            history: [],
            actions: {}
        };

        var url = '/mgd:create/state/' + encodeURIComponent(type) + '/';
        if (this.id) {
            url += encodeURIComponent(this.id) + '/';
        }

        jQuery.ajax({
            url: url,
            async: false,
            dataType: 'json',
            success: function(data) {
                if (   typeof data === 'null'
                    || typeof data.object === 'undefined') {
                    return;
                }
                workflowState.label = data.object.type;
                workflowState.actions = data.state.actions;
                workflowState.history = data.state.history;
                callback(workflowState);
            },
            error: function() {
            }
        });
    };

    midgardCreate.objectManager.models[type] = Backbone.Model.extend(modelProperties);

    return midgardCreate.objectManager.models[type];
};

midgardCreate.objectManager.getInstanceForContainer = function(objectContainer) {
    var model = midgardCreate.objectManager.getModelForContainer(objectContainer);
    var properties = midgardCreate.objectManager.getContainerProperties(objectContainer, false);
    var view = midgardCreate.objectManager.getViewForContainer(objectContainer);
    properties.id = objectContainer.attr('about');

    var modelInstance = new model(properties);
    var modelInstanceView = new view({model: modelInstance, el: objectContainer});
    return modelInstance;
};
