if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.ImagePlaceholders = {};

midgardCreate.ImagePlaceholders.init = function() {
    midgardCreate.ImagePlaceholders.placeHolders = [];

    midgardCreate.ImagePlaceholders.placeholderModel = Backbone.Model.extend({});
};

midgardCreate.ImagePlaceholders.enablePlaceholders = function() {
    var placeholders = jQuery('img[mgd\\:locationname]');
    jQuery.each(placeholders, function(index, placeholderElement)
    {
        var placeholderElement = jQuery(placeholderElement);
        var placeHolder = new midgardCreate.ImagePlaceholders.placeholderModel({
            id: placeholderElement.attr('mgd:parentguid'),
            element: placeholderElement,
            locationName: placeholderElement.attr('mgd:locationname'),
            variant: placeholderElement.attr('mgd:variant')
        });

        midgardCreate.ImagePlaceholders.placeHolders[midgardCreate.ImagePlaceholders.placeHolders.length] = placeHolder;

        jQuery(placeholderElement).bind('click', function() {
             midgardCreate.Image.showSelectDialog(placeHolder, placeHolder.get('locationName'), placeHolder.get('variant'), midgardCreate.ImagePlaceholders.insertImage);
        });
    });
};

midgardCreate.ImagePlaceholders.disablePlaceholders = function() {
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder)
    {
        jQuery(placeHolder.get('element')).unbind('click');
    });
};

midgardCreate.ImagePlaceholders.insertImage = function(imageInfo) {
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder) {
        if (placeHolder.id != imageInfo.get('parentguid')) {
            console.log('Not GUID', placeHolder.id, imageInfo.get('parentguid'));
            return true;
        }
        if (placeHolder.get('locationName') != imageInfo.get('locationname')) {
            console.log('Not location', placeHolder.get('locationName'), imageInfo.get('locationname'));
            return true;
        }
        placeHolderElement = placeHolder.get('element');
        placeHolderElement.attr('src', imageInfo.get('displayURL'));
        placeHolderElement.attr('title', imageInfo.get('title'));
    });
};
