/**
 * Midgard Create initialization
 */
/**
 * This file is generated automatically from Literate Programming code
 * stored in the README.txt documentation file in this repository.
 * Instead of modifying this file directly, modify the corresponding
 * code chunks in README.txt and regenerate it using the tangle command
 * of noweb.php:
 *
 *    $ noweb.php tangle README.txt
 *
 * Read more about the concept in:
 * @link http://bergie.iki.fi/blog/literate_programming_with_php/
 */

// Include dependencies of Midgard Create
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/editable.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/containers.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/image.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplaceholders.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js"></script>');

// Initialize Midgard Create
jQuery(document).ready(function() {
    if (typeof midgardCreate == 'undefined') {
        midgardCreate = {};
    }
    midgardCreate.highlightcolor = '#67cc08';
    midgardCreate.toolbar = {};
    midgardCreate.toolbar.minimized = jQuery('<a id="midgard-bar-minimized" class="ui-widget-showbut"></a>');
    jQuery('body').append(midgardCreate.toolbar.minimized);
    midgardCreate.toolbar.full = jQuery('<div id="midgard-bar"><div class="ui-widget-content"><div class="toolbarcontent"><div class="midgard-logo-button"><a id="midgard-bar-hidebutton" class="ui-widget-hidebut"></a></div><div class="toolbarcontent-left"></div><div class="toolbarcontent-center"></div><div class="toolbarcontent-right"></div></div></div>');
    jQuery('body').append(midgardCreate.toolbar.full);
    midgardCreate.toolbar.minimized.bind('click', function() {
        midgardCreate.toolbar.show();
        return false;
    });
    var hideButton = jQuery('#midgard-bar-hidebutton');
    hideButton.bind('click', function() {
        midgardCreate.toolbar.hide();
        return false;
    });
    midgardCreate.toolbar.show = function() {
       midgardCreate.toolbar.minimized.slideToggle();
       midgardCreate.toolbar.full.slideToggle();
       if (Modernizr.sessionstorage) {
           sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'full');
       }
    }
    midgardCreate.toolbar.hide = function() {
        midgardCreate.toolbar.full.slideToggle();
        midgardCreate.toolbar.minimized.slideToggle();
        if (Modernizr.sessionstorage) {
            sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'minimized');
        }
    }
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
    else {
        midgardCreate.toolbar.minimized.hide();
    }
    midgardCreate.Containers.init();
    midgardCreate.Image.init();
    midgardCreate.ImagePlaceholders.init();
    midgardCreate.Editable.init();
});