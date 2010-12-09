// Inform Aloha of our installation directory
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/Aloha-Editor/WebContent/';

// Include main Aloha
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'core/include.js"></script>');
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.HighlightEditables/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/org.midgardproject.aloha.plugins.Save/plugin.js"></script>');

// Start up Aloha
jQuery(document).ready(function() {
    GENTICS.Aloha.settings = {
        "ribbon": true,
        "language": "en",
    };

    var objectcontainers = jQuery('[mgd\\:guid]');
    jQuery.each(objectcontainers, function(index, objectinstance)
    {
        var objectinstance = jQuery(objectinstance);
        var children = jQuery('*', objectinstance).filter(function() {
            return jQuery(this).attr('mgd:property'); 
        });
        var guid = objectinstance.attr('mgd:guid');
        if (!guid)
        {
            return true;
        }
        var type = objectinstance.attr('mgd:type');
        
        if (typeof midgardproject.SavePlugin.objects[guid] == "undefined") {
            midgardproject.SavePlugin.objects[guid] = {};
        }

        midgardproject.SavePlugin.objects[guid].type = type;
        midgardproject.SavePlugin.objects[guid].element = objectinstance;
        midgardproject.SavePlugin.objects[guid].properties = {};

        jQuery.each(children, function(index, childinstance)
        {
            var childinstance = jQuery(childinstance);
            var propertyName = childinstance.attr('mgd:property');
            midgardproject.SavePlugin.objects[guid].properties[propertyName] = new GENTICS.Aloha.Editable(childinstance);
            childinstance.MIDGARDMVC_UI_CREATE_GUID = guid;
        });
    });
});
