// Include Aloha Editor
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/js/deps/aloha/';
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'deps/extjs/ext-jquery-adapter.js"></script>');
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'deps/extjs/ext-all.js"></script>');
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'deps/jquery.cookie.js"></script>');
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'aloha-nodeps.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Paste/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Table/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Link/plugin.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplugin.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/popover.js"></script>');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/js/deps/popover.css">');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/jquery.easydate-0.2.4.min.js"></script>');

if (typeof midgardCreate === 'undefined') {
    midgardCreate = {};
}

midgardCreate.Editable = {
    objects: [],
    currentObject: null,
    editableTimer: null,
    editTransfered: false,
    saveTransfered: false,

    init: function() {
        // Add an area for object actions
        midgardCreate.Editable.objectActions = jQuery('<div id="midgardcreate-objectactions"></div>').hide();
        jQuery('#midgard-bar .toolbarcontent-center').append(midgardCreate.Editable.objectActions);

        midgardCreate.Editable.objectHistory = jQuery('<div id="midgardcreate-objecthistory"></div>').hide();
        jQuery('body').append(midgardCreate.Editable.objectHistory);

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
        midgardCreate.Editable.saveButton = jQuery('<button id="midgardcreate-save">Save</button>').button({disabled: true});
        jQuery('#midgard-bar .toolbarcontent-right').append(midgardCreate.Editable.saveButton);

        // Add Edit toggle to the toolbar
        jQuery('#midgard-bar .toolbarcontent-right').append(jQuery('<input type="checkbox" id="midgardcreate-edit" /><label for="midgardcreate-edit">Edit</label>'));
        midgardCreate.Editable.editButton = jQuery('#midgardcreate-edit').button();

        if (midgardCreate.checkCapability('sessionstorage')) {
            // Check if user is in editing state
            var editorState = sessionStorage.getItem('midgardmvc_ui_create_state');
            if (editorState === 'edit')
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
        // Hide old popover, if any
        jQuery(midgardCreate.Editable.objectActions).children('a.popover-on').click();

        midgardCreate.Editable.objectActions.fadeOut('fast', function() {

            if (midgardCreate.Editable.currentObject === null) {
                return;
            }

            midgardCreate.Editable.currentObject.getWorkflowState(function(stateData) {
                midgardCreate.Editable.objectActions.empty();

                var objectLabel = jQuery('<a class="objectlabel">' + stateData.label + '</a>');
                midgardCreate.Editable.objectActions.append(objectLabel);
                jQuery.each(stateData.actions, function(action, actionLabel) {
                    var actionButton = jQuery('<button>' + actionLabel + '</button>').button();
                    midgardCreate.Editable.objectActions.append(actionButton);
                    actionButton.bind('click', function() {
                        midgardCreate.Editable.runWorkflow(midgardCreate.Editable.currentObject, action);
                    });
                });

                midgardCreate.Editable.objectHistory.empty();
                jQuery.each(stateData.history, function(history, historyItem) {
                    var historyEntry = jQuery('<div></div>');
                    historyEntry.html('<strong>' + historyItem.actor.firstname + ' ' + historyItem.actor.lastname + '</strong><span class="date">' + jQuery.easydate.format_date(new Date(historyItem.time)) + '</span>' + historyItem.verb);
                    midgardCreate.Editable.objectHistory.append(historyEntry);
                });
                objectLabel.popover({
                    header: jQuery('<div>' + stateData.label + ': ' + stateData.state + '</div>'),
                    content: midgardCreate.Editable.objectHistory
                });
                midgardCreate.Editable.objectHistory.show();

                midgardCreate.Editable.objectActions.fadeIn();
            });

        });
    },

    runWorkflow: function(targetObject, workflow) {
        targetObject.runWorkflow(workflow, function(data) {
            if (data.object === 'remove')
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

        if (midgardCreate.Editable.editableTimer !== null) {
            window.clearInterval(midgardCreate.Editable.editableTimer);
            midgardCreate.Editable.editableTimer = null;
        }
        midgardCreate.Editable.editableTimer = window.setInterval(function() {
            midgardCreate.Editable.checkEditable(objectInstance, propertyName);
        }, 1000);

        if (midgardCreate.Editable.currentObject === objectInstance) {
            return;
        }
        midgardCreate.Editable.currentObject = objectInstance;
        midgardCreate.Editable.showCurrentObject();
    },

    deactivateEditable: function(objectInstance, propertyName) {
        if (midgardCreate.Editable.editableTimer !== null) {
            window.clearInterval(midgardCreate.Editable.editableTimer);
            midgardCreate.Editable.editableTimer = null;
        }
    },

    checkEditable: function(objectInstance, propertyName) {
        if (objectInstance.editables[propertyName].isModified())
        {
            midgardCreate.Editable.setModified(true);
        }
    },

    setModified: function(modified) {
        if (modified) {
            midgardCreate.Editable.saveTransfered = false;
            midgardCreate.Editable.saveButton.button({disabled: false});
        }
        else {
            midgardCreate.Editable.saveButton.button({disabled: true});
        }
    },

    enableEditable: function(objectInstance) {
        if (!midgardCreate.Editable.editTransfered) {
            // First element, show transfer to signify what is going on
            midgardCreate.Editable.editButton.effect('transfer', { to: objectInstance.view.el }, 1000);
            midgardCreate.Editable.editTransfered = true;
        }

        // Seek editable properties from RDFa
        objectInstance.editables = {};
        jQuery.each(jQuery('[property]', objectInstance.view.el), function(index, objectProperty)
        {
            var objectProperty = jQuery(objectProperty);
            var propertyName = objectProperty.attr('property');
            objectInstance.editables[propertyName] = new GENTICS.Aloha.Editable(objectProperty);

            // Subscribe to activation and deactivation events
            GENTICS.Aloha.EventRegistry.subscribe(objectInstance.editables[propertyName], 'editableActivated', function() {
                midgardCreate.Editable.activateEditable(objectInstance, propertyName); 
            });
            GENTICS.Aloha.EventRegistry.subscribe(objectInstance.editables[propertyName], 'editableDeactivated', function() {
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
            if (   typeof objectIdentifier === 'undefined'
                || objectIdentifier === 'mgd:containerPlaceholder') {
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

            objectInstance.save(null, {
                success: function(savedModel, response) {
                    if (!midgardCreate.Editable.saveTransfered) {
                        savedModel.view.el.effect('transfer', { to: jQuery(midgardCreate.Editable.saveButton) }, 1000);
                        midgardCreate.Editable.saveTransfered = true;
                    }

                    jQuery.each(modifiedProperties, function(propertyName, propertyValue) {
                        savedModel.editables[propertyName].setUnmodified();
                    });

                    if (midgardCreate.Editable.currentObject === savedModel) {
                        midgardCreate.Editable.showCurrentObject();
                    }
                }
            });
        });

        midgardCreate.Editable.saveButton.button('option', 'label', 'Save');
        midgardCreate.Editable.setModified(false);
    }
};
