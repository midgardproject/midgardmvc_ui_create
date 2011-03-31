/**
 * Midgard Create initialization
 */

if (typeof midgardCreate === 'undefined') {
    midgardCreate = {};
}

midgardCreate.require = function(script) {
    if (typeof script !== 'string') {
        for (index in script) {
            midgardCreate.require(script[index]);
        }
        return;
    }
    
    if (script.substr(0, 1) !== '/') {
        script = '/midgardmvc-static/midgardmvc_ui_create/js/' + script;
    }

    required = [];
    if (required.indexOf(script) !== -1) {
        return;
    }
    document.write('<script type="text/javascript" src="' + script + '"></script>');
    required.push(script);
};

// Include dependencies of Midgard Create
midgardCreate.require([
    'deps/modernizr-1.6.min.js',
    /*'objectmanager.js',
    'editable.js',
    'collections.js',
    'image.js',
    'imageplaceholders.js',*/
    'deps/underscore-min.js',
    'deps/backbone-min.js',
    'deps/vie.js',
    'midgardToolbar.js',
    'midgardEditable.js',
    'midgardCreate.js'
]);
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');

// Initialize Midgard Create
jQuery(document).ready(function() {
    jQuery('body').midgardCreate();

    /*
    midgardCreate.objectManager.init();
    midgardCreate.Collections.init();
    midgardCreate.Image.init();
    midgardCreate.ImagePlaceholders.init();
    midgardCreate.Editable.init();
        midgardCreate.checkCapability = function(capability) {
        if (capability === 'contentEditable') {
            if (navigator.userAgent.match(/iPhone/i)) {
                return false;
            }
            if (navigator.userAgent.match(/iPod/i)) {
                return false;
            }
            if (navigator.userAgent.match(/iPad/i)) {
                return false;
            }
            return true;
        }
        if (capability === 'fileUploads') {
            if (navigator.userAgent.match(/iPhone/i)) {
                return false;
            }
            if (navigator.userAgent.match(/iPod/i)) {
                return false;
            }
            if (navigator.userAgent.match(/iPad/i)) {
                return false;
            }
            if (typeof FileReader === 'undefined') {
                return false;
            }
            if (typeof FormData === 'undefined') {
                return false;
            }
            return Modernizr.draganddrop;
        }
        return Modernizr[capability];
    };
    */
});
