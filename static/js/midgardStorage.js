(function(jQuery, undefined) {
    jQuery.widget('Midgard.midgardStorage', {
        options: {
            localStorage: false
        },
    
        _create: function() {
            var widget = this;
            
            if (Modernizr.localstorage) {
                this.options.localStorage = true;
            }
            
            Backbone.emulateHTTP = true;
            Backbone.emulateJSON = true;
            VIE.EntityManager.initializeCollection();
            VIE.EntityManager.entities.bind('add', function(model) {
                widget._prepareEntity(model);
            });
        },
        
        _prepareEntity: function(model) {
            var widget = this;
            
            // Add the Midgard-specific save URL used by Backbone.sync
            model.url = '/mgd:create/object/';
            
            // Special edited event coming from midgardEditable
            model.bind('edit:edited', function(model) {
                widget._saveLocal(model);
                jQuery('#midgardcreate-save').button({disabled: false});
            });
            
            model.bind('edit', function(model) {
                widget._readLocal(model);
            });
            
            model.bind('browse', function(model) {
                widget._restoreLocal(model);
                jQuery('#midgardcreate-save').button({disabled: true});
            });
        },

        _saveLocal: function(model) {
            if (!this.options.localStorage) {
                return;
            }

            if (model.isNew()) {
                // TODO: We need a list of these
                return;
            }
            
            localStorage.setItem(model.getSubject(), JSON.stringify(model.toJSONLD()));
        },

        _readLocal: function(model) {
            if (!this.options.localStorage) {
                return;
            }
            
            var local = localStorage.getItem(model.getSubject());
            if (!local) {
                return;
            }
            model.originalAttributes = _.clone(model.attributes);
            var entity = VIE.EntityManager.getByJSONLD(JSON.parse(local));
        },
        
        _restoreLocal: function(model) {
            if (jQuery.isEmptyObject(model.changedAttributes())) {
                if (model.originalAttributes) {
                    model.set(model.originalAttributes);
                    delete model.originalAttributes;
                }
                return;
            }
            model.set(model.previousAttributes());
        }
    })
})(jQuery);
