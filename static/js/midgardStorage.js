(function(jQuery, undefined) {
    jQuery.widget('Midgard.midgardStorage', {
        options: {
            localStorage: false,
            changedModels: []
        },
    
        _create: function() {
            var widget = this;
            
            if (Modernizr.localstorage) {
                this.options.localStorage = true;
            }

            VIE.EntityManager.initializeCollection();
            VIE.EntityManager.entities.bind('add', function(model) {
                widget._prepareEntity(model);
            });
            
            jQuery('#midgardcreate-save').click(function() {
                widget._saveRemote({
                    success: function() {
                        jQuery('#midgardcreate-save').button({disabled: true});
                    },
                    error: function() {
                        console.log("Save failed");
                    }
                });
            });
        },
        
        _prepareEntity: function(model) {
            var widget = this;
            
            // Add the Midgard-specific save URL used by Backbone.sync
            model.url = '/mgd:create/object/';
            model.toJSON = model.toJSONLD;
            
            // Regular change event from VIE
            model.bind('change', function(model) {
                if (_.indexOf(widget.options.changedModels, model) === -1) {
                    widget.options.changedModels.push(model);
                }
                jQuery('#midgardcreate-save').button({disabled: false});
            });
            
            // Special edited event coming from midgardEditable
            model.bind('edit:edited', function(model) {
                if (_.indexOf(widget.options.changedModels, model) === -1) {
                    widget.options.changedModels.push(model);
                }
                widget._saveLocal(model);
                jQuery('#midgardcreate-save').button({disabled: false});
            });
            
            // When entering edit state with an entity
            model.bind('edit', function(model) {
                widget._readLocal(model);
            });
            
            // When leaving edit state with an entity
            model.bind('browse', function(model) {
                widget._restoreLocal(model);
                jQuery('#midgardcreate-save').button({disabled: true});
            });
        },
        
        _saveRemote: function(options) {
            var widget = this;
            var needed = widget.options.changedModels.length;
            _.forEach(widget.options.changedModels, function(model, index) {
                model.save(null, {
                    success: function() {
                        if (model.originalAttributes) {
                            // From now on we're going with the values we have on server
                            delete model.originalAttributes;
                        }
                        widget._removeLocal(model);
                        delete widget.options.changedModels[index];
                        needed--;
                        if (needed <= 0) {
                            // All models were happily saved
                            options.success();
                        }
                    },
                    error: function() {
                        options.error();
                    }
                });
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
        },
        
        _removeLocal: function(model) {
            if (!this.options.localStorage) {
                return;
            }
            
            localStorage.removeItem(model.getSubject());
        }
    })
})(jQuery);
