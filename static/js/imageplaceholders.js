if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.ImagePlaceholders = {};

midgardCreate.ImagePlaceholders.init = function() {
    midgardCreate.ImagePlaceholders.placeHolders = [];
};

midgardCreate.ImagePlaceholders.enablePlaceholders = function() {
    var placeholders = jQuery('img[mgd\\:locationname]');
    jQuery.each(placeholders, function(index, placeholderElement)
    {
        var placeHolder = {};
        placeHolder.element = jQuery(placeholderElement);
        placeHolder.parentGuid = placeHolder.element.attr('mgd:parentguid');
        placeHolder.locationName = placeHolder.element.attr('mgd:locationname');
        placeHolder.variant = placeHolder.element.attr('mgd:variant');

        midgardCreate.ImagePlaceholders.placeHolders[midgardCreate.ImagePlaceholders.placeHolders.length] = placeHolder;

        jQuery(placeHolder.element).bind('click', function() {
             midgardCreate.Image.showSelectDialog(placeHolder.parentGuid, placeHolder.locationName, midgardCreate.ImagePlaceholders.insertImage);
        });
    });
};

midgardCreate.ImagePlaceholders.disablePlaceholders = function() {
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder)
    {
        jQuery(placeHolder.element).unbind('click');
    });
};

midgardCreate.ImagePlaceholders.insertImage = function(imageInfo) {
    console.log(imageInfo);
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder) {
        console.log(placeHolder);
        if (placeHolder.parentGuid != imageInfo.parentguid) {
            return;
        }
        if (placeHolder.locationName != imageInfo.locationName) {
            return;
        }
        placeHolderElement = jQuery(placeHolder.element);
        placeHolderElement.attr('src', imageInfo.url);
    });
};

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
};
