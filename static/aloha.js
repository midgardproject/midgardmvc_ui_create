// Inform Aloha of our installation directory
GENTICS_Aloha_base = '/midgardmvc-static/midgardmvc_ui_create/Aloha-Editor/WebContent/';

// Include main Aloha
document.write('<script type="text/javascript" src="' + GENTICS_Aloha_base + 'core/include.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/com.gentics.aloha.plugins.List/plugin.js"></script>');
document.write('<script type="text/javascript" src="' +GENTICS_Aloha_base + 'plugins/org.midgardproject.aloha.plugins.Save/plugin.js"></script>');

// Start up Aloha
jQuery(document).ready(function() {
    GENTICS.Aloha.settings = {
        "ribbon": true,
        "language": "en"
    };
});

