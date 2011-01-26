if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.ImagePlaceholders = {};

midgardCreate.ImagePlaceholders.init = function() {
    midgardCreate.ImagePlaceholders.placeHolders = [];

    midgardCreate.ImagePlaceholders.placeholderModel = Backbone.Model.extend({
        url: function() {
            return '/mgd:create/image/associatelocation/' + encodeURIComponent(this.id) + '/';
        }
    });
};

midgardCreate.ImagePlaceholders.enablePlaceholders = function() {
    var placeholders = jQuery('img[mgd\\:locationname]');
    jQuery.each(placeholders, function(index, placeholderElement)
    {
        var placeholderElement = jQuery(placeholderElement);
        var placeholderVariant = placeholderElement.attr('mgd:variant');
        var placeHolder = new midgardCreate.ImagePlaceholders.placeholderModel({
            id: placeholderElement.attr('mgd:parentguid'),
            locationName: placeholderElement.attr('mgd:locationname'),
            attachmentGuid: ''
        });
        placeHolder.element = placeholderElement;

        midgardCreate.ImagePlaceholders.placeHolders[midgardCreate.ImagePlaceholders.placeHolders.length] = placeHolder;

        jQuery(placeholderElement).bind('click', function() {
            midgardCreate.Image.showSelectDialog(placeHolder, placeholderVariant, function(imageInfo) {
                midgardCreate.ImagePlaceholders.insertImage(imageInfo, placeHolder);
            });
        });
    });
};

midgardCreate.ImagePlaceholders.disablePlaceholders = function() {
    jQuery.each(midgardCreate.ImagePlaceholders.placeHolders, function(index, placeHolder)
    {
        jQuery(placeHolder.element).unbind('click');
    });
};

midgardCreate.ImagePlaceholders.insertImage = function(imageInfo, placeHolder) {
    placeHolder.set({attachmentGuid: imageInfo.id});
    placeHolder.save();
    placeHolder.element.attr('src', imageInfo.get('displayURL'));
    placeHolder.element.attr('title', imageInfo.get('title'));
};
