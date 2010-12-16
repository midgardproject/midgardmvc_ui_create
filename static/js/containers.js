if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}

midgardCreate.Containers = {};

midgardCreate.Containers.init = function() {
    midgardCreate.Containers.containers = [];
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
                rdfPropertyInstance.html('<span class="placeholder">&lt' + rdfPropertyInstance.attr('property') + '&gt;</span>');
            });

            // Go through identified objects in the first child
            var rdfIdentifiers = jQuery('*', newChild).filter(function() {
                return jQuery(this).attr('about'); 
            });
            rdfIdentifiers.each(function(index, rdfIdentifierInstance) {
                // Clear any RDF identifiers
                var rdfIdentifierInstance = jQuery(rdfIdentifierInstance);
                rdfIdentifierInstance.attr('about', '');

                // Add container base URL
                rdfIdentifierInstance.attr('mgd:baseurl', container.element.attr('mgd:baseurl'));
            });

            if (order == 'desc')
            {
                newChild.prependTo(container.element);
            }
            else
            {
                newChild.appendTo(container.element);
            }
            midgardCreate.Editable.enableEditable(newChild.children('[typeof]'));
        });

        if (order == 'desc')
        {
            container.element.before(container.button);
        }
        else
        {
            container.element.after(container.button);
        }

        container.button.effect('highlight');
        midgardCreate.Containers.containers[midgardCreate.Containers.containers.length] = container;
    });
};

midgardCreate.Containers.disableContainers = function() {
    for (i=0; i < midgardCreate.Containers.containers.length; i++) {
        midgardCreate.Containers.containers[i].button.remove();
    }
}
