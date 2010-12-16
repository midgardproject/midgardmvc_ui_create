// Midgard Create plugins
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/editable.js"></script>');

document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/containers.js"></script>');

// Include toolbar dependencies
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/jquery.jixedbar.min.js"></script>');
document.write('<link type="text/css" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard/jx.stylesheet.css" rel="stylesheet" />');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');

// Start up Aloha
jQuery(document).ready(function() {

    if (typeof midgardCreate == 'undefined') {
        midgardCreate = {};
    }

    midgardCreate.toolbar = jQuery('<div id="midgard-bar"><div class="demo"><img src="/midgardmvc-static/midgardmvc_ui_create/themes/midgard/midgard_logo.gif" alt=""/></div></div>');
    jQuery('body').append(midgardCreate.toolbar);

    midgardCreate.toolbar.jixedbar();

    // Enable the Editables functionality
    midgardCreate.Editable.init();

    // Enable the Containers functionality
    midgardCreate.Containers.init();
});

