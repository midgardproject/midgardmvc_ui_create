if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.imagePlugin = new GENTICS.Aloha.Plugin('org.midgardproject.create.aloha.plugins.Image');

midgardCreate.imagePlugin.languages = [];

midgardCreate.imagePlugin.init = function() {
    // Insert image button
    var insertLinkButton = new GENTICS.Aloha.ui.Button({
        'iconClass' : 'GENTICS_button midgardCreate_button_img',
        'size' : 'small',
        'onclick' : function (element, event) { 
            midgardCreate.Image.showSelectDialog(midgardCreate.Editable.currentObject, '', midgardCreate.imagePlugin.insertImage);
        },
        'toggle' : false
    });
    GENTICS.Aloha.FloatingMenu.addButton(
        'GENTICS.Aloha.continuoustext',
        insertLinkButton,
        GENTICS.Aloha.i18n(GENTICS.Aloha, 'floatingmenu.tab.insert'),
        1
    );
};

midgardCreate.imagePlugin.insertImage = function(imageInfo) {
    var rangeObject = GENTICS.Aloha.Selection.rangeObject;
    var markUp = jQuery('<img src="' + imageInfo.url + '" title="' + imageInfo.title + '" />');
    GENTICS.Utils.Dom.insertIntoDOM(markUp, rangeObject);
}
