// Include Aloha Editor
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/js/deps/aloha/';
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'aloha.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Paste/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Table/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Link/plugin.js"></script>');

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

    midgardCreate.Editable.imageButtons = false;

    // Add Save button to the toolbar
    midgardCreate.Editable.saveButton = jQuery('<button id="midgardcreate-save">Save</button>').button();
    //midgardCreate.toolbar.append(midgardCreate.Editable.saveButton);
    jQuery('#midgard-bar .toolbarcontent-right').append(midgardCreate.Editable.saveButton);
    // TODO: Enable saving only after edits
    // midgardCreate.Editable.saveButton.button({disabled: true});

    // Add Edit toggle to the toolbar
    jQuery('#midgard-bar .toolbarcontent-right').append(jQuery('<input type="checkbox" id="midgardcreate-edit" /><label for="midgardcreate-edit">Edit</label>'))
    midgardCreate.Editable.editButton = jQuery('#midgardcreate-edit').button();

    // Add an area for object actions
    midgardCreate.Editable.objectActions = jQuery('<div id="midgardcreate-objectactions"></div>').hide();
    jQuery('#midgard-bar .toolbarcontent-center').append(midgardCreate.Editable.objectActions);

    if (!midgardCreate.Editable.imageButtons) {
        // Insert image button
        var insertLinkButton = new GENTICS.Aloha.ui.Button({
            'iconClass' : 'GENTICS_button midgardCreate_button_img',
            'size' : 'small',
            'onclick' : function (element, event) { 
                midgardCreate.Image.showSelectDialog(midgardCreate.Editable.currentObject, midgardCreate.Editable.insertImage);
            },
            'toggle' : false
        });
        GENTICS.Aloha.FloatingMenu.addButton(
            'GENTICS.Aloha.continuoustext',
            insertLinkButton,
            'Insert',
            1
        );
        midgardCreate.Editable.imageButtons = true;
    }

    if (Modernizr.sessionstorage) {
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

midgardCreate.Editable.insertImage = function(imageInfo) {
    var rangeObject = GENTICS.Aloha.Selection.rangeObject;
    var markUp = jQuery('<img src="' + imageInfo.url + '" title="' + imageInfo.title + '" />');
    GENTICS.Utils.Dom.insertIntoDOM(markUp, rangeObject);
}

midgardCreate.Editable.activateEditable = function(editableObject, propertyName) {
    if (midgardCreate.Editable.currentObject == editableObject.identifier) {
        return;
    }
    midgardCreate.Editable.currentObject = editableObject.identifier;

    midgardCreate.Editable.objectActions.fadeOut().empty();
    var url = '/mgd:create/state/' + encodeURIComponent(editableObject.type) + '/' + encodeURIComponent(editableObject.identifier);
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
    var url = '/mgd:create/run/' + encodeURIComponent(editableObject.type) + '/' + encodeURIComponent(editableObject.identifier) + '/' + workflow;
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
    editableObject.identifier = objectContainer.attr('about');
    if (editableObject.identifier == 'urn:uuid:') {
        editableObject.identifier = '';
    }
    editableObject.type = objectContainer.attr('typeof');
    editableObject.baseurl = objectContainer.attr('mgd:baseurl');
    editableObject.container = objectContainer;

    if (transfer) {
        // First element, show transfer to signify what is going on
        midgardCreate.Editable.editButton.effect('transfer', { to: jQuery(objectContainer) }, 1000);
    }

    // Seek editable properties
    editableObject.properties = {};
    var objectProperties = jQuery('*', objectContainer).filter(function() {
        return jQuery(this).attr('property'); 
    });
    jQuery.each(objectProperties, function(index, objectProperty)
    {
        var objectProperty = jQuery(objectProperty);
        var propertyName = objectProperty.attr('property');
        editableObject.properties[propertyName] = {
            
            element: objectProperty,
            aloha: new GENTICS.Aloha.Editable(objectProperty)
        };

        // Subscribe to activation and deactivation events
        GENTICS.Aloha.EventRegistry.subscribe(editableObject.properties[propertyName].aloha, 'editableActivated', function() { midgardCreate.Editable.activateEditable(editableObject, propertyName); });
        GENTICS.Aloha.EventRegistry.subscribe(editableObject.properties[propertyName].aloha, 'editableDeactivated', function() { midgardCreate.Editable.deactivateEditable(editableObject, propertyName); });

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

    if (Modernizr.sessionstorage) {
        // Set session to editing state
        sessionStorage.setItem('midgardmvc_ui_create_state', 'edit');
    }

    midgardCreate.Containers.enableContainers();
    midgardCreate.ImagePlaceholders.enablePlaceholders();
};

midgardCreate.Editable.disableEditables = function() {

    if (Modernizr.sessionstorage) {
        // Remove editing state
        sessionStorage.removeItem('midgardmvc_ui_create_state');
    }

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

    // iterate all Midgard objects which have been made editable
    jQuery.each(midgardCreate.Editable.objects, function(objectIndex, editableObject) {

        var saveObject = {
            type: editableObject.type,
            identifier: editableObject.identifier,
            baseurl: editableObject.baseurl
        };

        var objectModified = false;
        jQuery.each(editableObject.properties, function(index, editableProperty) {
            if (editableProperty.aloha.isModified())
            {
                saveObject[index] = editableProperty.aloha.getContents();
                objectModified = true;

                if (!transfered) {
                    editableProperty.element.effect('transfer', { to: jQuery(midgardCreate.Editable.saveButton) }, 1000);
                    transfered = true;
                }
            }
        });

        if (!objectModified)
        {
            return true;
        }

        // Send the edited fields to the form handler backend
        var url = '/mgd:create/save/json';
        jQuery.ajax({
            url: url,
            dataType: 'json',
            data: saveObject,
            type: 'POST',
            success: function (response) {
                jQuery.each(editableObject.properties, function(index, editableProperty) {
                    editableProperty.aloha.setUnmodified();
                    editableObject.identifier = response.status.identifier;
                    editableObject.container.attr('about', response.status.identifier);
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                try
                {
                    response = jQuery.parseJSON(xhr.responseText);
                    message = response.status.message;
                }
                catch (e)
                {
                    message = xhr.statusText;
                }
                GENTICS.Aloha.Log.error("Midgard saving plugin", message);
            },
        });
    });
} ;
