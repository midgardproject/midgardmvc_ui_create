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
             midgardCreate.Image.showSelectDialog(placeHolder.parentGuid, placeHolder.locationName, midgardCreate.ImagePlaceholders.insertImage, false);
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
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder) {
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
