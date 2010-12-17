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
    // Configure Aloha
    GENTICS.Aloha.settings = {
        "ribbon": false,
        "language": "en"
    };

    midgardCreate.Editable.objects = [];

    // Add Save button to the toolbar
    midgardCreate.Editable.saveButton = jQuery('<button id="midgardcreate-save">Save</button>').button();
    //midgardCreate.toolbar.append(midgardCreate.Editable.saveButton);
    jQuery('#midgard-bar-contents').append(midgardCreate.Editable.saveButton);
    // TODO: Enable saving only after edits
    // midgardCreate.Editable.saveButton.button({disabled: true});

    // Add Edit toggle to the toolbar
    midgardCreate.Editable.editButton = jQuery('<input type="checkbox" id="midgardcreate-edit" /><label for="midgardcreate-edit">Edit</label>').button();
    //midgardCreate.toolbar.append(midgardCreate.Editable.editButton);
    jQuery('#midgard-bar-contents').append(midgardCreate.Editable.editButton);

    if (Modernizr.sessionstorage) {
        // Check if user is in editing state
        var editorState = sessionStorage.getItem('midgardmvc_ui_create_state');
        if (editorState == 'edit')
        {
            // Don't transfer when enabled from session
            midgardCreate.Editable.enableEditables(false);
            midgardCreate.Editable.editButton.attr('checked', true);
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

midgardCreate.Editable.enableEditable = function(objectContainer, transfer) {

    var editableObject = {};
    editableObject.identifier = objectContainer.attr('about');
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
