if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.ImagePlaceholders = {};

midgardCreate.ImagePlaceholders.init = function() {
    midgardCreate.ImagePlaceholders.placeholders = [];
};

midgardCreate.ImagePlaceholders.enablePlaceholders = function() {
    var placeholders = jQuery('[mgd\\:placeholder="true"]');
    jQuery.each(placeholders, function(index, placeholderElement)
    {
        jQuery(placeholderElement).bind('click', function() { midgardCreate.ImagePlaceholders.showForm(this); });
    });
}

midgardCreate.ImagePlaceholders.disablePlaceholders = function() {
    var placeholders = jQuery('[mgd\\:placeholder="true"]');
    jQuery.each(placeholders, function(index, placeholderElement)
    {
        jQuery(placeholderElement).unbind('click');
    });
}

midgardCreate.ImagePlaceholders.showForm = function(placeholderElement) {
    var placeholderElement = jQuery(placeholderElement);
    var objectGuid = placeholderElement.attr('mgd:parentguid');
    var locationName = placeholderElement.attr('mgd:locationname');
    var variant = placeholderElement.attr('mgd:variant');

    var uploadForm = jQuery('<form action="/mgd:attachment/upload/" method="post" enctype="multipart/form-data"></form>');
    jQuery('<input name="parentguid" type="hidden" value="' + objectGuid + '" />').appendTo(uploadForm);
    jQuery('<input name="locationname" type="hidden" value="' + locationName + '" />').appendTo(uploadForm);
    jQuery('<input name="variant" type="hidden" value="' + variant + '" />').appendTo(uploadForm);
    jQuery('<input name="file" type="file" />').appendTo(uploadForm);
    jQuery('<input name="submit" value="Upload" type="submit" />').button().appendTo(uploadForm);

    var uploadDialog = jQuery('<div id="midgardmvc-upload" title="Add an image"></div>').dialog();
    uploadDialog.append(uploadForm);
    uploadDialog.dialog('open');
}
