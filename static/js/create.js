// Midgard Create plugins
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/editable.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/containers.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/image.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplaceholders.js"></script>');

// Include toolbar dependencies
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/insertimage.css">');

// Start up Midgard Create
jQuery(document).ready(function() {

    if (typeof midgardCreate == 'undefined') {
        midgardCreate = {};
    }

    midgardCreate.toolbar = {};
    midgardCreate.toolbar.minimized = jQuery('<a id="midgard-bar-minimized" class="ui-widget-showbut"></a>');
    midgardCreate.toolbar.full = jQuery('<div id="midgard-bar"><div class="ui-widget-content"><div class="toolbarcontent"><div class="midgard-logo-button"><a id="midgard-bar-hidebutton" class="ui-widget-hidebut"></a></div><div class="toolbarcontent-left"></div><div class="toolbarcontent-center"></div><div class="toolbarcontent-right"></div></div></div>');

    jQuery('body').append(midgardCreate.toolbar.minimized);
    jQuery('body').append(midgardCreate.toolbar.full);

    if (Modernizr.sessionstorage) {
        var toolbarState = sessionStorage.getItem('midgardmvc_ui_create_toolbar');
        if (toolbarState == 'minimized')
        {
            midgardCreate.toolbar.full.hide();
        }
        else
        {
            midgardCreate.toolbar.minimized.hide();
        }
    }

    var hideButton = jQuery('#midgard-bar-hidebutton');
    hideButton.bind('click', function() {
        midgardCreate.toolbar.hide();
        return false;
    });

    midgardCreate.toolbar.minimized.bind('click', function() {
        midgardCreate.toolbar.show();
        return false;
    });

    midgardCreate.toolbar.hide = function() {
        midgardCreate.toolbar.full.slideToggle();
        midgardCreate.toolbar.minimized.slideToggle();

        if (Modernizr.sessionstorage) {
            sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'minimized');
        }
    };

    midgardCreate.toolbar.show = function() {
        midgardCreate.toolbar.minimized.slideToggle();
        midgardCreate.toolbar.full.slideToggle();

        if (Modernizr.sessionstorage) {
            sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'full');
        }
    };

    midgardCreate.highlightcolor = '#67cc08';

    // Enable the Containers functionality
    midgardCreate.Containers.init();

    // Enable the Image functionality
    midgardCreate.Image.init();

    // Enable the Image Placeholders functionality
    midgardCreate.ImagePlaceholders.init();

    // Enable the Editables functionality
    midgardCreate.Editable.init();
});

