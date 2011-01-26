if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Collections = {
    collections: [],

    init: function() {
        midgardCreate.Collections.loadFromPage();
    },

    enableCollections: function() {
        jQuery.each(midgardCreate.Collections.collections, function(index, collectionInstance) {
            collectionInstance.view.addButton = jQuery('<button>Add</button>').button();

            collectionInstance.view.addButton.click(function() {
                collectionInstance.add([{}]);
            });

            if (collectionInstance.order == 'asc') {
                collectionInstance.view.el.after(collectionInstance.view.addButton);
            }
            else
            {
                collectionInstance.view.el.before(collectionInstance.view.addButton);
            }

            collectionInstance.view.addButton.effect('highlight', { color: midgardCreate.highlightcolor }, 3000);
        });
    },

    disableCollections: function() {
        jQuery.each(midgardCreate.Collections.collections, function(index, collectionInstance) {
            var removeItems = [];
            collectionInstance.forEach(function(collectionItem) {
                if (typeof collectionItem.id == 'undefined')
                {
                    removeItems[removeItems.length] = collectionItem;
                }
            });
            collectionInstance.remove(removeItems);

            if (typeof collectionInstance.view.addButton == 'undefined') {
                return;
            }
            collectionInstance.view.addButton.remove();
        });
    },

    loadFromPage: function() {
        var objectCollections = jQuery('[mgd\\:type="container"]');
        jQuery.each(objectCollections, function(index, collectionElement)
        {
            var collectionElement = jQuery(collectionElement);

            var firstChild = collectionElement.children(':first-child');
            if (midgardCreate.objectManager.getIdentifierForContainer(firstChild) == 'mgd:containerPlaceholder') {
                firstChild.hide();
            }

            var orderFromElement = collectionElement.attr('mgd:order');
            if (typeof orderFromElement == 'undefined') {
                orderFromElement = 'asc';
            }

            var urlPattern = collectionElement.attr('mgd:urlpattern');
            if (typeof urlPattern == 'undefined') {
                urlPattern = null;
            }

            var collectionCollection = Backbone.Collection.extend({
                model: midgardCreate.objectManager.getModelForContainer(firstChild),
                order: orderFromElement,
                urlpattern: urlPattern
            });
            var collectionInstance = new collectionCollection({});

            // Insert baseURLs to models if one is set
            if (typeof collectionElement.attr('mgd:baseurl') != 'undefined')
            {
                collectionInstance.bind('add', function(itemInstance) {
                    itemInstance.set({baseurl: collectionElement.attr('mgd:baseurl')});
                });
            }

            var itemView = midgardCreate.objectManager.getViewForContainer(midgardCreate.objectManager.getCleanContainer(firstChild));
            var collectionView = Backbone.View.extend({
                collection: collectionInstance,
                el: collectionElement,

                initialize: function() {
                    _.bindAll(this, 'addItem', 'removeItem');
                    this.collection.bind('add', this.addItem);
                    this.collection.bind('remove', this.removeItem);
                },

                addItem: function(itemInstance) {
                    new itemView({model: itemInstance});
                    var itemViewElement = itemInstance.view.render().el;
                    if (this.collection.order == 'asc') {
                        this.el.append(itemViewElement);
                    } else {
                        this.el.prepend(itemViewElement);
                    }
                    itemViewElement.effect('slide');
                    midgardCreate.Editable.enableEditable(itemInstance);
                },

                removeItem: function(itemInstance) {
                    if (typeof itemInstance.view == 'undefined') {
                        return;
                    }
                    itemInstance.view.el.hide('drop');
                }
            });

            collectionInstance.view = new collectionView({});

            midgardCreate.Collections.collections[midgardCreate.Collections.collections.length] = collectionInstance;
        });
    }
};
