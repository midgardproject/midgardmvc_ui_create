if (typeof midgardproject == 'undefined') {
    midgardproject = {};
}

midgardproject.ContainersPlugin = {};

midgardproject.ContainersPlugin.containers = [];

midgardproject.ContainersPlugin.find = function() {
    var objectcontainers = jQuery('[mgd\\:type="container"]');
    jQuery.each(objectcontainers, function(index, container)
    {
        var container = jQuery(container);

        var order = container.attr('mgd:order');
        if (typeof order == 'undefined') {
            order = 'asc';
        }

        var button = jQuery('<button>Add</button>').click(function() {
            // Clone the first child of the container
            var newChild = container.children(':first-child').clone(false);
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
                rdfIdentifierInstance.attr('mgd:baseurl', container.attr('mgd:baseurl'));
            });

            if (order == 'desc')
            {
                newChild.prependTo(container);
            }
            else
            {
                newChild.appendTo(container);
            }
            midgardproject.SavePlugin.enableEditable(newChild.children('[typeof]'));
        });

        if (order == 'desc')
        {
            container.before(button);
        }
        else
        {
            container.after(button);
        }

        midgardproject.ContainersPlugin.containers[midgardproject.ContainersPlugin.containers.length] = container;
    });
};
