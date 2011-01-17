// Midgard Create plugins
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/editable.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/containers.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/image.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplaceholders.js"></script>');

// Include toolbar dependencies
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/toolbar.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/insertimage.css">');

// Start up Midgard Create
jQuery(document).ready(function() {

    if (typeof midgardCreate == 'undefined') {
        midgardCreate = {};
    }

    midgardCreate.toolbar = jQuery('<div id="midgard-bar"><div id="midgard-bar-effect" class="ui-widget-content"><div class="toolbarcontent"><div class="midgard-logo-button"><a href="#" id="hideshowbutton" class="ui-widget-hidebut"></a></div><div class="toolbarcontent-left"></div><div class="toolbarcontent-right"></div></div></div>');
    jQuery('body').append(midgardCreate.toolbar);

    midgardCreate.highlightcolor = '#67cc08';

    // Enable the Containers functionality
    midgardCreate.Containers.init();

    // Enable the Image functionality
    midgardCreate.Image.init();

    // Enable the Image Placeholders functionality
    midgardCreate.ImagePlaceholders.init();

    // Enable the Editables functionality
    midgardCreate.Editable.init();

    // Set effect from select menu value
    $( "#hideshowbutton" ).click(function() {
        $( "#midgard-bar-effect" ).toggle('blind', {}, 500 );
        return false;
    });

});

