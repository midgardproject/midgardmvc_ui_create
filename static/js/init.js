/**
 * Midgard Create initialization
 */

// Include dependencies of Midgard Create
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/modernizr.custom.80485.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/underscore-min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/backbone-min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/vie-min.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/hallo.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/deps/hallo/format.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/src/jquery.Midgard.midgardCreate.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/src/jquery.Midgard.midgardToolbar.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/src/jquery.Midgard.midgardStorage.js"></script>');
document.write('<script type="text/javascript" src="/midgardmvc-static/create/src/jquery.Midgard.midgardEditable.js"></script>');

// Initialize Midgard Create
jQuery(document).ready(function()
{
    jQuery('body').midgardCreate({
        url: '/mgd:create/object'
    });
});