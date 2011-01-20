// Include Aloha Editor
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/js/deps/aloha/';
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'aloha.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Paste/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Table/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Link/plugin.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplugin.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/objectmanager.js"></script>');

if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Editable = {};

midgardCreate.Editable.init = function() {

    if (!midgardCreate.checkCapability('contentEditable')) {
        return;
    }

    // Configure Aloha
    GENTICS.Aloha.settings = {
        "ribbon": false,
        "language": "en"
    };

    midgardCreate.Editable.objects = [];

    midgardCreate.Editable.currentObject = null;

    // Add Save button to the toolbar
    midgardCreate.Editable.saveButton = jQuery('<button id="midgardcreate-save">Save</button>').button();
    //midgardCreate.toolbar.append(midgardCreate.Editable.saveButton);
    jQuery('#midgard-bar .toolbarcontent-right').append(midgardCreate.Editable.saveButton);

    // Add Edit toggle to the toolbar
    jQuery('#midgard-bar .toolbarcontent-right').append(jQuery('<input type="checkbox" id="midgardcreate-edit" /><label for="midgardcreate-edit">Edit</label>'))
    midgardCreate.Editable.editButton = jQuery('#midgardcreate-edit').button();

    // Add an area for object actions
    midgardCreate.Editable.objectActions = jQuery('<div id="midgardcreate-objectactions"></div>').hide();
    jQuery('#midgard-bar .toolbarcontent-center').append(midgardCreate.Editable.objectActions);

    if (midgardCreate.checkCapability('sessionstorage')) {
        // Check if user is in editing state
        var editorState = sessionStorage.getItem('midgardmvc_ui_create_state');
        if (editorState == 'edit')
        {
            // Don't transfer when enabled from session
            midgardCreate.Editable.enableEditables(false);
            midgardCreate.Editable.editButton.attr('checked', true);
            midgardCreate.Editable.editButton.button('refresh');
        }
    }

    midgardCreate.Editable.editButton.bind('change', function() {
        if (midgardCreate.Editable.editButton.attr('checked')) {
            midgardCreate.Editable.enableEditables(true);
            return;
        }
        midgardCreate.Editable.disableEditables();
    });

    midgardCreate.Editable.saveButton.bind('click', function() {
        midgardCreate.Editable.save();
    });
}

midgardCreate.Editable.activateEditable = function(editableObject, propertyName) {
    if (midgardCreate.Editable.currentObject == editableObject.model) {
        return;
    }
    midgardCreate.Editable.currentObject = editableObject.model;

    midgardCreate.Editable.objectActions.fadeOut().empty();
    var url = '/mgd:create/state/' + encodeURIComponent(editableObject.type) + '/' + encodeURIComponent(editableObject.model.id);
    jQuery.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
            var objectLabel = jQuery('<a>' + data.object.type + '</a>');
            midgardCreate.Editable.objectActions.append(objectLabel);

            jQuery.each(data.state.actions, function(action, actionLabel) {
                var actionButton = jQuery('<button>' + actionLabel + '</button>').button();
                midgardCreate.Editable.objectActions.append(actionButton);
                actionButton.bind('click', function() {
                    midgardCreate.Editable.runWorkflow(editableObject, action);
                });
            });
            midgardCreate.Editable.objectActions.fadeIn();
        }
    });
}

midgardCreate.Editable.deactivateEditable = function(editableObject, propertyName) {
}

midgardCreate.Editable.runWorkflow = function(editableObject, workflow) {
    var url = '/mgd:create/run/' + encodeURIComponent(editableObject.type) + '/' + encodeURIComponent(editableObject.model.id) + '/' + workflow;
    jQuery.ajax({
        url: url,
        dataType: 'json',
        type: 'POST',
        success: function (response) {
            if (response.object == 'remove') {
                jQuery(editableObject.container).hide('drop');
                return;
            }
        }
    });
}

midgardCreate.Editable.enableEditable = function(objectContainer, transfer) {
    var editableObject = {};
    editableObject.model = midgardCreate.objectManager.getInstanceForContainer(objectContainer);

    editableObject.type = objectContainer.attr('typeof');
    editableObject.baseurl = objectContainer.attr('mgd:baseurl');
    editableObject.container = objectContainer;

    if (transfer) {
        // First element, show transfer to signify what is going on
        midgardCreate.Editable.editButton.effect('transfer', { to: jQuery(objectContainer) }, 1000);
    }

    // Seek editable properties
    editableObject.properties = {};
    jQuery.each(jQuery('[property]', objectContainer), function(index, objectProperty)
    {
        var objectProperty = jQuery(objectProperty);
        var propertyName = objectProperty.attr('property');
        editableObject.properties[propertyName] = {
            
            element: objectProperty,
            aloha: new GENTICS.Aloha.Editable(objectProperty)
        };

        // Subscribe to activation event
        GENTICS.Aloha.EventRegistry.subscribe(editableObject.properties[propertyName].aloha, 'editableActivated', function() {
            midgardCreate.Editable.activateEditable(editableObject, propertyName); 
        });

        objectProperty.effect('highlight', { color: midgardCreate.highlightcolor }, 3000);
    });

    midgardCreate.Editable.objects[midgardCreate.Editable.objects.length] = editableObject;
};

midgardCreate.Editable.enableEditables = function(transfer) {
    var objectContainers = jQuery('[typeof]');
    jQuery.each(objectContainers, function(index, objectContainer)
    {
        var objectContainer = jQuery(objectContainer);
        if (typeof objectContainer.attr('about') == 'undefined') {
            // No identifier set, therefore not editable
            return true;
        }
        midgardCreate.Editable.enableEditable(objectContainer, transfer);

        if (transfer) {
            // Transfer only first element
            transfer = false;
        }
    });

    if (midgardCreate.checkCapability('sessionstorage')) {
        // Set session to editing state
        sessionStorage.setItem('midgardmvc_ui_create_state', 'edit');
    }

    midgardCreate.Containers.enableContainers();
    midgardCreate.ImagePlaceholders.enablePlaceholders();
};

midgardCreate.Editable.disableEditables = function() {

    if (midgardCreate.checkCapability('sessionstorage')) {
        // Remove editing state
        sessionStorage.removeItem('midgardmvc_ui_create_state');
    }

    midgardCreate.Editable.objectActions.empty();

    midgardCreate.Containers.disableContainers();
    midgardCreate.ImagePlaceholders.disablePlaceholders();

    jQuery.each(midgardCreate.Editable.objects, function(index, editableObject) {
        jQuery.each(editableObject.properties, function(propertyName, editableProperty) {
            editableProperty = jQuery(editableProperty.element);
            editableProperty.mahalo();
        });
    });
    midgardCreate.Editable.objects = [];
};

midgardCreate.Editable.save = function () {
    var transfered = false;

    midgardCreate.Editable.saveButton.button('option', 'label', 'Saving');

    // iterate all Midgard objects which have been made editable
    jQuery.each(midgardCreate.Editable.objects, function(objectIndex, editableObject) {
        var objectModified = false;
        var modifiedProperties = {};

        if (editableObject.baseurl) {
            modifiedProperties.baseurl = editableObject.baseurl;
        }

        jQuery.each(editableObject.properties, function(index, editableProperty) {
            if (!editableProperty.aloha.isModified())
            {
                return;
            }
            modifiedProperties[index] = editableProperty.aloha.getContents();
            objectModified = true;

            if (!transfered) {
                editableProperty.element.effect('transfer', { to: jQuery(midgardCreate.Editable.saveButton) }, 1000);
                transfered = true;
            }
        });

        if (!objectModified)
        {
            return true;
        }

        editableObject.model.set(modifiedProperties);
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;
        editableObject.model.save();
        editableObject.container.attr('about', editableObject.model.id);
    });

    midgardCreate.Editable.saveButton.button('option', 'label', 'Save');
} ;
