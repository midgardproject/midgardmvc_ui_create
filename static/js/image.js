document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/insertimage.css">');

if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Image = {
    imageSelectDialog: null,
    imageDialog: null,
    collection: null,
    searchTerm: '',
    currentObject: null,
    variantName: '',

    init: function() {
        midgardCreate.Image.prepareCollection();
    },

    prepareCollection: function() {
        var imageModel = Backbone.Model.extend({
            initialize: function() {
                if (!this.get('displayURL'))
                {
                    this.set({displayUrl: ''});
                }
                if (!this.get('name'))
                {
                    this.set({name: ''});
                }
                if (!this.get('title'))
                {
                    this.set({name: this.get('name')});
                }
            },

            upload: function() {
                var imageInstance = this;
                var form = new FormData();
                form.append('file', imageInstance.get('file'));
                form.append('parentguid', imageInstance.get('parentguid'));

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
                    if (typeof data.displayURL != 'undefined')
                    {
                        // Force image refresh
                        var now = new Date();
                        data.displayURL = data.displayURL + '?' + now.getTime();
                    }
                    imageInstance.set(data);

                    imageInstance.view.render();
                    midgardCreate.Image.showImageDialog(imageInstance);
                };
                xhr.send(form);
            }
        });

        var imageView = Backbone.View.extend({
            tagName: 'li',

            events: {
                'click': 'showDialog'
            },

            initialize: function() {
                _.bindAll(this, 'render', 'showDialog');
                this.model.bind('change', this.render);
                this.model.view = this;
            },

            showDialog: function() {
                midgardCreate.Image.showImageDialog(this.model);
            },

            render: function() {
                jQuery(this.el).html('<img src="' + this.model.get('displayURL') + '" title="' + this.model.get('title') + '" typeof="http://purl.org/dc/dcmitype/Image" mgd:placeholder="true" width="100" height="100" />');
                return this;
            }
        });

        var imageCollection = Backbone.Collection.extend({
            model: imageModel,
            view: imageView,

            url: function() {
                return '/mgd:create/image/search/' + encodeURIComponent(midgardCreate.Image.searchTerm);
            }
        });

        midgardCreate.Image.collection = new imageCollection();

        midgardCreate.Image.collection.bind('add', function(itemInstance) {
            new imageView({model: itemInstance});
            midgardCreate.Image.collection.viewElement.prepend(itemInstance.view.render().el);
            if (itemInstance.get('file'))
            {
                itemInstance.upload();
            }
        });

        midgardCreate.Image.collection.bind('remove', function(itemInstance) {
            itemInstance.view.el.remove();
        });

        midgardCreate.Image.collection.bind('refresh', function(collectionInstance) {
            collectionInstance.viewElement.empty();
            collectionInstance.forEach(function(itemInstance) {
                new imageView({model: itemInstance});
                collectionInstance.viewElement.append(itemInstance.view.render().el);
            });
        });
    },

    showSelectDialog: function(currentObject, variantName, callback) {
        midgardCreate.Image.currentObject = currentObject;
        midgardCreate.Image.variantName = variantName;
        midgardCreate.Image.callback = callback;
        midgardCreate.Image.prepareSelectDialog();

        if (midgardCreate.checkCapability('fileUploads')) {
            midgardCreate.Image.prepareUploadTarget();
        }

        midgardCreate.Image.imageSelectDialog.dialog('open');
        midgardCreate.Image.collection.fetch();
    },

    prepareSelectDialog: function() {
        var dialogOptions = {
            show: 'fade',
            hide: 'fade',
            title: 'Choose an image',
            height: 300,
            width: 400,
            zIndex: 12000
        };
        midgardCreate.Image.imageSelectDialog = jQuery('<div id="midgardmvc-image"></div>');

        var searchBar = jQuery('<div id="midgardmvc-image-list"></div>');

        var searchInput = jQuery('<input type="search" name="midgardmvc-image-search" placeholder="Search existing images" />');
        searchInput.change(function () {
            midgardCreate.Image.searchTerm = jQuery(this).val();
            midgardCreate.Image.collection.fetch();
        });
        searchBar.append(searchInput);

        midgardCreate.Image.imageSelectDialog.append(searchBar);

        var imageList = jQuery('<ul class="midgardmvc-image-list"></ul>');
        searchBar.append(imageList);
        midgardCreate.Image.collection.viewElement = imageList;

        midgardCreate.Image.imageSelectDialog.dialog(dialogOptions);
    },

    prepareUploadTarget: function() {
        var uploadPlaceholder = jQuery('<div id="midgardmvc-image-upload"><h2>Add new image</h2><img id="midgardmvc-image-upload-target" src="/midgardmvc-static/midgardmvc_helper_attachmentserver/placeholder.png" typeof="http://purl.org/dc/dcmitype/Image" mgd:placeholder="true" width="100" height="100" /></div>');
        midgardCreate.Image.imageSelectDialog.prepend(uploadPlaceholder);
        var placeholderElement = document.getElementById('midgardmvc-image-upload');

        uploadPlaceholder.get(0).addEventListener('drop', function(event) {
            event.stopPropagation();
            event.preventDefault();
            midgardCreate.Image.addDroppedFile(event);
        }, true);

        uploadPlaceholder.get(0).addEventListener('dragenter', function(event) {
            event.stopPropagation();
            event.preventDefault();
            jQuery(uploadPlaceholder).addClass('midgardmvc-image-hover');
        }, true);

        uploadPlaceholder.get(0).addEventListener('dragleave', function(event) {
            event.stopPropagation();
            event.preventDefault();
            jQuery(uploadPlaceholder).removeClass('midgardmvc-image-hover');
        }, true);

        uploadPlaceholder.get(0).addEventListener('dragover', function(event) {
            event.stopPropagation();
            event.preventDefault();
            jQuery(uploadPlaceholder).addClass('midgardmvc-image-hover');
        }, true);
    },

    addDroppedFile: function(event) {
        var files = event.dataTransfer.files;
        jQuery.each(event.dataTransfer.files, function(i, file) {
            var reader = new FileReader();
            reader.file = file;
            reader.onloadend = function(event) {
                if (!event.target.file) {
                    return;
                }
                midgardCreate.Image.collection.add({
                    title: event.target.file.name,
                    name: event.target.file.name,
                    displayURL: event.target.result,
                    file: event.target.file,
                    parentguid: midgardCreate.Image.currentObject.id
                });
            };
            reader.readAsDataURL(file);
        });
        return false;
    },

    showImageDialog: function(imageObject) {
        midgardCreate.Image.imageSelectDialog.dialog('close');

        if (midgardCreate.Image.imageDialog != null) {
            midgardCreate.Image.imageDialog.dialog('close');
            midgardCreate.Image.imageDialog = null;
        }

        var dialogOptions = {
            show: 'fade',
            hide: 'fade',
            title: 'Image: ' + imageObject.get('title'),
            height: 300,
            width: 400,
            zIndex: 12000
        };
        midgardCreate.Image.imageDialog = jQuery('<div id="midgardmvc-image-details"></div>');

        var showImage = jQuery('<img src="' + imageObject.get('displayURL') + '" style="max-width: 400px; max-height: 200px;" />');
        midgardCreate.Image.imageDialog.append(showImage);

        var dialogButtons = {
            'Back to search': function() {
                jQuery(this).dialog('close');
                midgardCreate.Image.imageSelectDialog.dialog('open');
            }
        };

        var imageVariants = imageObject.get('variants');
        if (imageVariants) {
            jQuery.each(imageVariants, function(variantName, variantLabel) {
                if (   midgardCreate.Image.variantName != ''
                    && variantName != midgardCreate.Image.variantName)
                {
                    return true;
                }
                dialogButtons['Use ' + variantLabel] = function() {
                    // Force image refresh
                    var now = new Date();
                    imageObject.set({'displayURL': '/mgd:attachment/' + imageObject.id + '/' + variantName + '/' + imageObject.get('name') + '?' + now.getTime()});
                    midgardCreate.Image.callback(imageObject);
                    if (midgardCreate.Image.imageDialog != null) {
                        midgardCreate.Image.imageDialog.dialog('close');
                        midgardCreate.Image.imageDialog.remove();
                        midgardCreate.Image.imageDialog.remove = null;
                    }
                }
            });
        }

        dialogOptions.buttons = dialogButtons;
        midgardCreate.Image.imageDialog.dialog(dialogOptions);
    }
};
