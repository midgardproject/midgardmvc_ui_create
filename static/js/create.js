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
    'deps/underscore-min.js',
    'deps/backbone-min.js',
    'deps/vie.js',
    'midgardToolbar.js',
    'midgardEditable.js',
    'midgardStorage.js',
    'midgardCreate.js',
]);
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');

// Initialize Midgard Create
jQuery(document).ready(function() {
    jQuery('body').midgardCreate();
});
