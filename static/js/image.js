//document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/jquery.filedrop.js"></script>');

if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Image = {};

midgardCreate.Image.init = function() {
    midgardCreate.Image.imageSelectDialog = null;
    midgardCreate.Image.imageDialog = null;
    midgardCreate.Image.variants = {};
};

midgardCreate.Image.canUpload = function()
{
    if (typeof FileReader == 'undefined') {
        return false;
    }
    if (typeof FormData == 'undefined') {
        return false;
    }
    return true;
}

midgardCreate.Image.searchImages = function(searchTerm, callback) {
    midgardCreate.Image.clearSelectDialog();

    var url = '/mgd:create/image/search/';
    jQuery.ajax({
        url: url,
        dataType: 'json',
        data: {
            q: searchTerm
        },
        success: function(data) {
            midgardCreate.Image.variants = data.variants;
            jQuery.each(data.images, function(imageId, imageInfo) {
                midgardCreate.Image.imageList.append(midgardCreate.Image.getImageListElement(imageInfo, callback));
            });
        }
    });
};

midgardCreate.Image.prepareSelectDialog = function(identifier, locationName, callback) {
    var dialogOptions = {
        show: 'drop',
        hide: 'drop',
        title: 'Choose an image',
        height: 300,
        width: 400
    };
    midgardCreate.Image.imageSelectDialog = jQuery('<div id="midgardmvc-image"></div>');

    var searchBar = jQuery('<div id="midgardmvc-image-list"></div>');

    var searchInput = jQuery('<input type="search" name="midgardmvc-image-search" placeholder="Search existing images" />');
    searchInput.change(function () {
        midgardCreate.Image.searchImages(jQuery(this).val(), callback);
    });
    searchBar.append(searchInput);

    midgardCreate.Image.imageSelectDialog.append(searchBar);

    midgardCreate.Image.imageList = jQuery('<ul class="midgardmvc-image-list"></ul>');
    searchBar.append(midgardCreate.Image.imageList);

    midgardCreate.Image.imageSelectDialog.dialog(dialogOptions);

    if (midgardCreate.Image.canUpload()) {
        midgardCreate.Image.prepareUploadTarget(identifier, locationName, callback);
    }
};

midgardCreate.Image.showSelectDialog = function(identifier, locationName, callback) {
    midgardCreate.Image.prepareSelectDialog(identifier, locationName, callback);
    midgardCreate.Image.imageSelectDialog.dialog('open');
    midgardCreate.Image.searchImages('', callback);
};

midgardCreate.Image.prepareUploadTarget = function(identifier, locationName, callback) {
    var uploadPlaceholder = jQuery('<div id="midgardmvc-image-upload"><h2>Add new image</h2><img id="midgardmvc-image-upload-target" src="/midgardmvc-static/midgardmvc_helper_attachmentserver/placeholder.png" typeof="http://purl.org/dc/dcmitype/Image" mgd:placeholder="true" width="100" height="100" /></div>');
    midgardCreate.Image.imageSelectDialog.prepend(uploadPlaceholder);
    var placeholderElement = document.getElementById('midgardmvc-image-upload');

    placeholderElement.addEventListener('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.dataTransfer.files;
        jQuery.each(event.dataTransfer.files, function(i, file) {
            var reader = new FileReader();
            reader.file = file;
            reader.onloadend = function(event) {
                if (!event.target.file) {
                    return;
                }
                var form = new FormData();
                form.append('file', event.target.file);
                form.append('parentguid', identifier);

                if (locationName)
                {
                    form.append('locationname', locationName);
                }

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/mgd:create/image/upload/', false);
                xhr.onreadystatechange = function(event) {
                    if (xhr.readyState != 4) {
                        return;
                    }
                    if (xhr.status != 200) {
                        return;
                    }
                    var data = jQuery.parseJSON(xhr.responseText);
                    var imageInfo = {
                        url: data.image.url,
                        title: data.image.title,
                        name: data.image.name,
                        guid: data.image.guid,
                        parentguid: data.image.parentguid
                    };

                    midgardCreate.Image.imageList.prepend(midgardCreate.Image.getImageListElement(imageInfo, callback));
                    midgardCreate.Image.showImageDialog(imageInfo, midgardCreate.Image.variants, callback);
                };
                xhr.send(form);
            };
            reader.readAsDataURL(file);
        });
        return false;
    }, true);

    placeholderElement.addEventListener('dragenter', function(event) {
        event.stopPropagation();
        event.preventDefault();
    }, true);

    placeholderElement.addEventListener('dragleave', function(event) {
        event.stopPropagation();
        event.preventDefault();
    }, true);

    placeholderElement.addEventListener('dragover', function(event) {
        event.stopPropagation();
        event.preventDefault();
    }, true);
};

midgardCreate.Image.showImageDialog = function(imageInfo, imageVariants, callback) {
    midgardCreate.Image.imageSelectDialog.dialog('close');

    if (midgardCreate.Image.imageDialog != null) {
        midgardCreate.Image.imageDialog.dialog('close');
        midgardCreate.Image.imageDialog = null;
    }

    var dialogOptions = {
        show: 'drop',
        hide: 'drop',
        title: 'Image: ' + imageInfo.title,
        height: 300,
        width: 400,
    };
    midgardCreate.Image.imageDialog = jQuery('<div id="midgardmvc-image-details"></div>');

    var showImage = jQuery('<img src="' + imageInfo.url + '" style="max-width: 400px; max-height: 200px;" />');
    midgardCreate.Image.imageDialog.append(showImage);

    var dialogButtons = {
        'Back to search': function() {
            jQuery(this).dialog('close');
            midgardCreate.Image.imageSelectDialog.dialog('open');
        }
    };

    jQuery.each(imageVariants, function(variantName, variantLabel) {
        dialogButtons['Use ' + variantLabel] = function() {
            imageInfo.url = '/mgd:attachment/' + imageInfo.guid + '/' + variantName + '/' + imageInfo.name;
            callback(imageInfo);
            if (midgardCreate.Image.imageDialog != null) {
                midgardCreate.Image.imageDialog.dialog('close');
                midgardCreate.Image.imageDialog = null;
            }
        }
    });

    dialogOptions.buttons = dialogButtons;
    midgardCreate.Image.imageDialog.dialog(dialogOptions);
};

midgardCreate.Image.clearSelectDialog = function() {
    midgardCreate.Image.imageList.empty();
};

midgardCreate.Image.getImageListElement = function(imageInfo, callback) {
    var imageElement = jQuery('<li><img src="' + imageInfo.url + '" title="' + imageInfo.title + '" typeof="http://purl.org/dc/dcmitype/Image" mgd:placeholder="true" width="100" height="100" /></li>');
    imageElement.click(function() { 
        midgardCreate.Image.showImageDialog(imageInfo, midgardCreate.Image.variants, callback) 
    });
    return imageElement;
};
