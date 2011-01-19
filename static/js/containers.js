if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Containers = {};

midgardCreate.Containers.init = function() {
    midgardCreate.Containers.containers = [];

    midgardCreate.Containers.hideContainerPlaceholders();
};

midgardCreate.Containers.hideContainerPlaceholders = function() {
    var placeHolders = jQuery('[about="mgd:containerPlaceholder"]');
    jQuery.each(placeHolders, function(index, placeHolderElement)
    {
        jQuery(placeHolderElement).hide();
    });
};

midgardCreate.Containers.enableContainers = function() {
    var objectcontainers = jQuery('[mgd\\:type="container"]');
    jQuery.each(objectcontainers, function(index, containerElement)
    {
        var container = {};
        container.element = jQuery(containerElement);

        var order = container.element.attr('mgd:order');
        if (typeof order == 'undefined') {
            order = 'asc';
        }

        container.button = jQuery('<button>Add</button>').button().click(function() {
            // Clone the first child of the container
            var newChild = container.element.children(':first-child').clone(false);
            // Empty contents of all editable RDF properties
            var rdfProperties = jQuery('*', newChild).filter(function() {
                return jQuery(this).attr('property'); 
            });
            rdfProperties.each(function(index, rdfPropertyInstance) {
                var rdfPropertyInstance = jQuery(rdfPropertyInstance);
                rdfPropertyInstance.html('&lt' + rdfPropertyInstance.attr('property') + '&gt;');
            });

            if (newChild.attr('about'))
            {
                // The primary container has the identifier
                midgardCreate.Containers.prepareNewChild(newChild, container.element);
            }
            else
            {
                // Go through identified objects in the first child
                var rdfIdentifiers = jQuery('*', newChild).filter(function() {
                    return jQuery(this).attr('about'); 
                });
                rdfIdentifiers.each(function(index, rdfIdentifierInstance) {
                    midgardCreate.Containers.prepareNewChild(rdfIdentifierInstance, container.element);
                });
            }

            if (order == 'desc')
            {
                newChild.prependTo(container.element);
            }
            else
            {
                newChild.appendTo(container.element);
            }
            newChild.effect('slide');

            if (newChild.attr('typeof'))
            {
                midgardCreate.Editable.enableEditable(newChild, false);
            }
            else
            {
                midgardCreate.Editable.enableEditable(newChild.children('[typeof]'), false);
            }
        });

        if (order == 'desc')
        {
            container.element.before(container.button);
        }
        else
        {
            container.element.after(container.button);
        }

        container.button.effect('highlight', { color: midgardCreate.highlightcolor }, 3000);
        midgardCreate.Containers.containers[midgardCreate.Containers.containers.length] = container;
    });
};

midgardCreate.Containers.prepareNewChild = function(childElement, containerElement) {
    // Clear any RDF identifiers
    var childElement = jQuery(childElement);
    childElement.show();
    childElement.attr('about', '');

    // Add container base URL
    childElement.attr('mgd:baseurl', containerElement.attr('mgd:baseurl'));
}

midgardCreate.Containers.disableContainers = function() {
    for (i=0; i < midgardCreate.Containers.containers.length; i++) {
        midgardCreate.Containers.containers[i].button.remove();
    }
}
