// Include Aloha Editor
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/js/deps/aloha/';
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'aloha.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Paste/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Table/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Link/plugin.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplugin.js"></script>');

if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Editable = {
    objects: [],
    currentObject: null,
    editTransfered: false,
    saveTransfered: false,

    init: function() {
        // Add an area for object actions
        midgardCreate.Editable.objectActions = jQuery('<div id="midgardcreate-objectactions"></div>').hide();
        jQuery('#midgard-bar .toolbarcontent-center').append(midgardCreate.Editable.objectActions);

        if (!midgardCreate.checkCapability('contentEditable')) {
            return;
        }

        midgardCreate.Editable.populateToolbar();
    },

    populateToolbar: function() {
        // Configure Aloha
        GENTICS.Aloha.settings = {
            "ribbon": false,
            "language": "en"
        };

        midgardCreate.Editable.currentObject = null;

        // Add Save button to the toolbar
        midgardCreate.Editable.saveButton = jQuery('<button id="midgardcreate-save">Save</button>').button();
        //midgardCreate.toolbar.append(midgardCreate.Editable.saveButton);
        jQuery('#midgard-bar .toolbarcontent-right').append(midgardCreate.Editable.saveButton);

        // Add Edit toggle to the toolbar
        jQuery('#midgard-bar .toolbarcontent-right').append(jQuery('<input type="checkbox" id="midgardcreate-edit" /><label for="midgardcreate-edit">Edit</label>'))
        midgardCreate.Editable.editButton = jQuery('#midgardcreate-edit').button();

        if (midgardCreate.checkCapability('sessionstorage')) {
            // Check if user is in editing state
            var editorState = sessionStorage.getItem('midgardmvc_ui_create_state');
            if (editorState == 'edit')
            {
                // Don't transfer when enabled from session
                midgardCreate.Editable.editTransfered = true;

                midgardCreate.Editable.enterEditState();

                midgardCreate.Editable.editButton.attr('checked', true);
                midgardCreate.Editable.editButton.button('refresh');
            }
        }

        midgardCreate.Editable.editButton.bind('change', function() {
            if (midgardCreate.Editable.editButton.attr('checked')) {
                midgardCreate.Editable.enterEditState();
                return;
            }
            midgardCreate.Editable.leaveEditState();
        });

        midgardCreate.Editable.saveButton.bind('click', function() {
            midgardCreate.Editable.save();
        });
    },

    showCurrentObject: function() {
        midgardCreate.Editable.objectActions.fadeOut();

        if (midgardCreate.Editable.currentObject == null) {
            return;
        }

        midgardCreate.Editable.currentObject.getWorkflowState(function(stateData) {
            midgardCreate.Editable.objectActions.empty();

            var objectLabel = jQuery('<a>' + stateData.label + '</a>');
            midgardCreate.Editable.objectActions.append(objectLabel);
            jQuery.each(stateData.actions, function(action, actionLabel) {
                var actionButton = jQuery('<button>' + actionLabel + '</button>').button();
                midgardCreate.Editable.objectActions.append(actionButton);
                actionButton.bind('click', function() {
                    midgardCreate.Editable.runWorkflow(midgardCreate.Editable.currentObject, action);
                });
            });

            midgardCreate.Editable.objectActions.fadeIn();
        });
    },

    runWorkflow: function(targetObject, workflow) {
        targetObject.runWorkflow(workflow, function(data) {
            if (data.object == 'remove')
            {
                targetObject.view.remove();
                midgardCreate.Editable.currentObject = null;
            }
            midgardCreate.Editable.showCurrentObject();
        });
    },

    activateEditable: function(objectInstance, propertyName) {
        /*if (objectInstance.get(propertyName) == objectInstance.getPlaceholder(propertyName)) {
            // TODO: Clear placeholder content when user starts editing
        }*/

        if (midgardCreate.Editable.currentObject == objectInstance) {
            return;
        }
        midgardCreate.Editable.currentObject = objectInstance;
        midgardCreate.Editable.showCurrentObject();
    },

    enableEditable: function(objectInstance) {
        if (midgardCreate.Editable.editTransfered) {
            // First element, show transfer to signify what is going on
            midgardCreate.Editable.editButton.effect('transfer', { to: objectInstance.view.el }, 1000);
            midgardCreate.Editable.editTransfered = false;
        }

        // Seek editable properties from RDFa
        objectInstance.editables = {};
        jQuery.each(jQuery('[property]', objectInstance.view.el), function(index, objectProperty)
        {
            var objectProperty = jQuery(objectProperty);
            var propertyName = objectProperty.attr('property');
            objectInstance.editables[propertyName] = new GENTICS.Aloha.Editable(objectProperty);

            // Subscribe to activation event
            GENTICS.Aloha.EventRegistry.subscribe(objectInstance.editables[propertyName], 'editableActivated', function() {
                midgardCreate.Editable.activateEditable(objectInstance, propertyName); 
            });

            objectProperty.effect('highlight', { color: midgardCreate.highlightcolor }, 3000);
        });

        midgardCreate.Editable.objects[midgardCreate.Editable.objects.length] = objectInstance;
    },

    enterEditState: function() {
        // Seek editable objects from DOM
        var objectContainers = jQuery('[typeof][about]');
        jQuery.each(objectContainers, function(index, objectContainer)
        {
            var objectContainer = jQuery(objectContainer);
            var objectIdentifier = objectContainer.attr('about');
            if (   typeof objectIdentifier == 'undefined'
                || objectIdentifier == 'mgd:containerPlaceholder') {
                // No identifier set, therefore not editable
                return true;
            }
            var objectInstance = midgardCreate.objectManager.getInstanceForContainer(objectContainer);
            midgardCreate.Editable.enableEditable(objectInstance);
        });

        if (midgardCreate.checkCapability('sessionstorage')) {
            // Set session to editing state
            sessionStorage.setItem('midgardmvc_ui_create_state', 'edit');
        }

        midgardCreate.Collections.enableCollections();
        midgardCreate.ImagePlaceholders.enablePlaceholders();
    },

    leaveEditState: function() {
        if (midgardCreate.checkCapability('sessionstorage')) {
            // Remove editing state
            sessionStorage.removeItem('midgardmvc_ui_create_state');
        }

        midgardCreate.Editable.objectActions.empty();

        midgardCreate.Collections.disableCollections();
        midgardCreate.ImagePlaceholders.disablePlaceholders();

        jQuery.each(midgardCreate.Editable.objects, function(index, objectInstance) {
            jQuery.each(objectInstance.editables, function(propertyName, alohaInstance) {
                alohaInstance.destroy();
            });
        });
        midgardCreate.Editable.objects = [];
    },

    save: function() {
        midgardCreate.Editable.saveButton.button('option', 'label', 'Saving');

        // iterate all Midgard objects which have been made editable
        jQuery.each(midgardCreate.Editable.objects, function(index, objectInstance) {
            var modifiedProperties = {};
            jQuery.each(objectInstance.editables, function(propertyName, alohaInstance) {
                if (!alohaInstance.isModified())
                {
                    return true;
                }
                modifiedProperties[propertyName] = alohaInstance.getContents();
            });

            if (jQuery.isEmptyObject(modifiedProperties))
            {
                return true;
            }

            objectInstance.set(modifiedProperties);

            if (!midgardCreate.Editable.saveTransfered) {
                objectInstance.view.el.effect('transfer', { to: jQuery(midgardCreate.Editable.saveButton) }, 1000);
                midgardCreate.Editable.saveTransfered = true;
            }

            objectInstance.save(null, {
                success: function(savedModel, response) {
                    if (midgardCreate.Editable.currentObject == savedModel) {
                        midgardCreate.Editable.showCurrentObject();
                    }
                }
            });
        });

        midgardCreate.Editable.saveButton.button('option', 'label', 'Save');
        midgardCreate.Editable.saveTransfered = true;
    }
};
