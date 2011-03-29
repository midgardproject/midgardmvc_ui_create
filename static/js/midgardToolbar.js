(function(jQuery, undefined) {
    jQuery.widget('Midgard.toolbar', {
        options: {
            display: 'full'
        },
    
        _create: function() {
            this.element.append(this._getMinimized().hide());
            this.element.append(this._getFull());
            
            var widget = this;
            jQuery('#midgard-bar-minimized').click(function() {
                widget.show();
            });
            jQuery('#midgard-bar-hidebutton').click(function() {
                widget.hide();
            });
            
            if (midgardCreate.checkCapability('sessionstorage') &&
                sessionStorage.getItem('Midgard.toolbar.state')) {
                this._setOption('display', sessionStorage.getItem('Midgard.toolbar.state'));
            }
        },
        
        _setOption: function(key, value) {
            if (key === 'display') {
                this._setDisplay(value);
            }
            this.options[key] = value;
        },
        
        _setDisplay: function(value) {
            if (value === 'minimized') {
                jQuery('#midgard-bar:visible', this.element).slideToggle();
                jQuery('#midgard-bar-minimized:hidden', this.element).slideToggle();
            } else {
                jQuery('#midgard-bar-minimized:visible', this.element).slideToggle();
                jQuery('#midgard-bar:hidden', this.element).slideToggle();
            }
        
            if (midgardCreate.checkCapability('sessionstorage')) {
                sessionStorage.setItem('Midgard.toolbar.state', value);
            }
        },
        
        hide: function() {
            this._setOption('display', 'minimized');
        },
        
        show: function() {
            this._setOption('display', 'full');
        },
        
        _getMinimized: function() {
            return jQuery('<a id="midgard-bar-minimized" class="midgard-create ui-widget-showbut"></a>');
        },
        
        _getFull: function() {
            return jQuery('<div class="midgard-create" id="midgard-bar"><div class="ui-widget-content"><div class="toolbarcontent"><div class="midgard-logo-button"><a id="midgard-bar-hidebutton" class="ui-widget-hidebut"></a></div><div class="toolbarcontent-left"></div><div class="toolbarcontent-center"></div><div class="toolbarcontent-right"></div></div></div>');
        }
    })
})(jQuery);
