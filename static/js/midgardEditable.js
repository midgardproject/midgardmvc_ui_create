// Include Aloha Editor
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/js/deps/aloha/';
midgardCreate.require([
    GENTICS_Aloha_base + 'deps/extjs/ext-jquery-adapter.js',
    GENTICS_Aloha_base + 'deps/extjs/ext-all.js',
    GENTICS_Aloha_base + 'deps/jquery.cookie.js',
    GENTICS_Aloha_base + 'aloha-nodeps.js',
    GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js',
    GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js',
    GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Paste/plugin.js',
    GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Table/plugin.js',
    GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Link/plugin.js'
]);

(function(jQuery, undefined) {
    jQuery.widget('Midgard.editable', {
        editables: [],
        model: null,
    
        options: {
            editor: 'aloha',
            enable: function() {},
            disable: function() {},
            activated: function() {},
            deactivated: function() {},
            changed: function() {}
        },
    
        _create: function() {
            this.model = VIE.RDFaEntities.getInstance(this.element);
        },
        
        _init: function() {
            if (this.options.disabled) {
                this.disable();
                return;
            }
            this.enable();
        },
        
        enable: function() {      
            var widget = this;
            VIE.RDFa.findPredicateElements(this.model.id, this.element, false).each(function() {
                return widget._enableProperty(jQuery(this));
            });
        },
        
        disable: function() {
            jQuery.each(this.editables, function(index, editable) {
                editable.setUnmodified();
                if (typeof editable.changeTimer !== 'undefined') {
                    window.clearInterval(editable.changeTimer);
                }
                try {
                    editable.destroy();
                } catch (err) {
                    console.log("Failed disable");
                }
            });
            
            this._trigger('disable', null, {
                instance: this.model,
                element: this.element
            });
        },
        
        _enableProperty: function(element) {
            var propertyName = VIE.RDFa.getPredicate(element);
            if (this.model.get(propertyName) instanceof Array) {
                // For now we don't deal with multivalued properties in Aloha
                return true;
            }

            var editable = new GENTICS.Aloha.Editable(element);
            editable.vieEntity = this.model;

            // Subscribe to activation and deactivation events
            var widget = this;
            GENTICS.Aloha.EventRegistry.subscribe(editable, 'editableActivated', function() {
                widget._trigger('activated', null, {
                    editable: editable,
                    property: propertyName,
                    instance: this.model,
                    element: element
                });
            });
            GENTICS.Aloha.EventRegistry.subscribe(editable, 'editableDeactivated', function() {
                widget._trigger('deactivated', null, {
                    editable: editable,
                    property: propertyName,
                    instance: this.model,
                    element: element
                });
            });
            
            // Register a timer to copy any modified contents
            editable.changeTimer = window.setInterval(function() {
                widget._checkModified(propertyName, editable);
            }, 2000);
            
            this._trigger('enable', null, {
                editable: editable,
                property: propertyName,
                instance: this.model,
                element: element
            });
            
            this.editables.push(editable);
        },
        
        _checkModified: function(propertyName, editable) {
            if (!editable.isModified()) {
                return true;
            }
            var changedProperties = {};
            changedProperties[propertyName] = editable.getContents();
            editable.setUnmodified();
            this.model.set(changedProperties, {silent: true});

            this._trigger('changed', null, {
                editable: editable,
                property: propertyName,
                instance: this.model,
                element: editable.obj
            });
        }
    })
})(jQuery);
