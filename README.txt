Midgard Create
==============

Midgard Create is a web editing tool (commonly known as [Content Management System](http://en.wikipedia.org/wiki/Content_management_system)) that allows users to manage all their web content within a browser-based interface.

## Interaction components

The user interaction concept implemented by Midgard Create is based on easy discoverability, and the ability to manage all content shown on a web page.

Midgard Create user interface is constructed dynamically based on introspecting the HTML5 content of a page. The actual Midgard Create is loaded via a JavaScript include, after which all other interaction components appear as needed.

### Edit mode

When accessing a website running Midgard Create, users can either interact with the site in _Browse Mode_ or _Edit Mode_. In Browse Mode the website behaves exactly in the same way as it does for regular users, meaning that no content is editable. However, there is a Midgard Create Toolbar available.

In Edit Mode all editable content can be modified, new items can be added to collections, and images and other files can be placed on the page.

### Toolbar

The Midgard Create toolbar is the main access point to the system. It floats on the top of the page, allowing quick access to functionality like the _Edit mode_ and _Saving_ content, and to running workflows on particular content items.

### Editables

Content items shown on web pages can be made editable by the user. The editability of content items is determined by marking them up with RDFa attributes describing the content.

A typical editable is a full web content item, for example an Article. It consists of multiple editable areas, for example Title and Content. Each of these can be edited separately. The Editables system keeps track of all user-made changes and enables users to Save them in bulk.

The actual content editing is implemented using a HTML5 contentEditable managed by the Aloha Editor. Aloha provides the typical formatting options needed for web content, like marking a part of text headline, or adding a table.

To make a content item Editable it needs to be marked up with RDFa attributes describing Midgard Create how to deal with it.

The HTML container where the item is displayed (for example, a `div` or `li` element) should identify the item:

* `about`: Identifier of that particular item. Typically handled in format `urn:uuid:<Midgard2 GUID>`
* `typeof`: Type of the item, typically either `mgd:<MgdSchema type name>` or a RDF type URL

Individual properties of the content item that are being displayed need also to be identified:

* `property`: The property being displayed, either `mgd:<property name>` or the RDF property name

Simple article example in HTML5 and RDFa:

    <article about="urn:uuid:b22842f81e3511e08dcec7b8cfa942754275" typeof="http://rdfs.org/sioc/ns#Post"> 
        <h1 property="dcterms:title">Article title</h1>
        <div property="sioc:content">
            <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
        </div> 
    </article> 

### Collections

In addition to individual content items, Midgard Create can also be used to manage Collections of them. With Collections the user interface provides functionality for adding new items of the type managed by a Collection.

Article listing example in HTML5 and RDFa:

    <ol mgd:type="container" mgd:order="desc" mgd:baseurl="/news/"> 
        <li>
            <article about="urn:uuid:b22842f81e3511e08dcec7b8cfa942754275" typeof="http://rdfs.org/sioc/ns#Post">
                <h3 property="dcterms:title">Article title</h3>
            </article>
        </li>
    </ol>

### Placed images

In addition to regular content items, web pages commonly have specific places for images to be displayed. If an image is missing, users in Edit mode will see a placeholder image displayed. Clicking it allows them to associate an existing Image asset from the system to that place, or to drag-and-drop a new image from their computer.

Placed images require the identifier of a content item holding them ("a parent GUID"), and a location name to distinquish them from regular images on a page.

Example of a placed image in HTML5 and RDFa:

    <img src='/midgardmvc-static/midgardmvc_helper_attachmentserver/placeholder.png' width='142' height='142' mgd:variant="thumbnail"  mgd:parentguid='2fad3ae4226411e0a12b755061092eea2eea' mgd:locationname='lift_image' typeof='http://purl.org/dc/dcmitype/Image' mgd:placeholder='true' /> 

### Workflows

Every content item may have multiple Workflows associated with it. The Workflows are defined globally for the Midgard Create system. When a content item is activated in editing mode (by clicking one of its content areas), the Workflows available for that item appear as buttons in the Toolbar.

Typical workflows include:

* Deleting content items
* Publishing content items
* Unpublishing content items

## System architecture

Midgard Create builds on a robust basis of web system components to keep the codebase clean, maintainable and simple. The system architecture of Midgard Create is the following:

* Content Repository: [Midgard2](http://midgard2.org) is used for all persistent content storage and retrieval
* Web framework: [Midgard MVC](https://github.com/midgardproject/midgardmvc_core/blob/master/documentation/index.markdown) provides a model-view-controller framework for PHP
* Server-side scripting language: [PHP5](http://php.net/) is used for building the server-side functionality
* Client-side scripting language: JavaScript with the [jQuery](http://jquery.com/) library is used for client-side scripting
* User interface: the [jQuery UI](http://jqueryui.com/) library is used for rendering the Midgard Create user interfaces
* HTML5 editor: [Aloha Editor](http://aloha-editor.org/) is used for content editing
* Workflow system: [Zeta Components Workflow](http://incubator.apache.org/zetacomponents/documentation/trunk/Workflow/tutorial.html) is used for server-side workflow definitions

## Site building

Websites managed with Midgard Create are built in the same way as regular Midgard MVC applications. This means that they consist of a tree of folders, each managed by a component. A component is a piece of software that provides the URL handling and corresponding templates for an area of a website. Examples of components include news listings, event calendars and product catalogues.

A typical Midgard Create website is run from a _Website component_ that provides the application manifest and default display templates for that website. Here we will describe such a component.

### Application manifest

Application manifest (usually called `application.yml`) is a configuration file driving a Midgard MVC web application. In the case of a Midgard Create -powered website, the application.yml provides the list of components to be enabled for that site, the base folder hierarchy, and default configurations for the Midgard MVC environment, like the authentication system used with that website.

#### Website node hierarchy

Websites are built by defining a hierarchy of folders that provide the content and functionality of the site. In a simple website or web application, the hierarchy would consist of just one folder providing all the functionality, but more complex websites can be built with hundreds of folders.

With Midgard MVC, folders can be stored in either configuration or the content repository. When they're stored in configuration they cannot be modified by the user, whereas folders stored in the repository can be changed and added to. This serves to distinquish websites where the hierarchy will stay static and will only be changed by site developers from sites where the folder structure itself is considered content.

Running the folder hierarchy from configuration (and so not modifiable by the user) can be accomplished by using the `configuration` hierarchy provider. User-modifiable folder structure can be handled by the `midgard2` hierarchy provider, enabled in the following way:

<<website application configuration>>=
providers_hierarchy: midgard2
@

The folders defined in application.yml should provide all the necessary functionality for running the website. This makes it easy for developers working on the website to deploy a functional copy on their own machines, and for testing purposes. It also makes it possible to define websites as distributable applications that new users can easily install.

Folder configuration begins by defining a _Root node_, the folder running the main directory of the website, for example _http://example.net/_. In our example we'll leave the root node to be managed by the Midgard MVC core component that only serves a single content page from that node:

<<website root node>>=
title: Example Corporation
component: midgardmvc_core
content: <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortut laoreet dolore magna aliquam er volutpat. Ut wisi enim ad minim veniam, quis nostrud my nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl u.</p>
@

All folders under the root node as configured as _children_ of that node:

<<website root node>>=
children:
    <<website subnodes>>
@

In this case we'll show a news listing in a folder `/news`:

<<website subnodes>>=
title: News
component: net_example_news
content: ''
@

#### Component installation

<<website application configuration>>=
providers_component: midgardmvc
@

#### Running the website

<<website application configuration>>=
services_dispatcher: appserv
@

## Implementation of the user interaction

User interaction is implemented in JavaScript with jQuery and jQuery UI.

All Midgard Create JavaScript functionality resides under a `midgardCreate` object. When Midgard Create is loaded we define it:

<<define midgardCreate>>=
if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}
@

### Loading Midgard Create

Initialization of Midgard Create is handled inside a jQuery callback that is run when the page load is completed:

<<midgard create initialization>>=
jQuery(document).ready(function() {
    <<define midgardCreate>>
    <<define effects>>
    <<define toolbar>>
    <<initialize collections>>
    <<initialize images>>
    <<initialize image placeholders>>
    <<initialize editables>>
});
@

For the toolbar we also need jQuery UI:

<<midgard create dependencies ui>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js"></script>');
@

The toolbar relies on a Midgard jQuery UI theme and its own additional CSS rules:

<<midgard create dependencies>>=
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');
@

### Effects

Midgard Create uses jQuery effects for making all transitions between stages and new elements appearing clearer to the user.

The system highlights elements that change based on user interaction. The highlight is used for example when an item becomes editable by the user when entering the Edit mode:

<<define effects>>=
midgardCreate.highlightcolor = '#67cc08';
@

### Toolbar

The toolbar is dynamically populated to the DOM of the current page. First we define a toolbar object to hold our Toolbar functionality:

<<define toolbar>>=
midgardCreate.toolbar = {};
@

There are two versions of toolbar, a minimized version that stays out of the way of regular page content:

<<define toolbar>>=
midgardCreate.toolbar.minimized = jQuery('<a id="midgard-bar-minimized" class="ui-widget-showbut"></a>');
jQuery('body').append(midgardCreate.toolbar.minimized);
@

And a full version that provides all buttons needed for user interaction:

<<define toolbar>>=
midgardCreate.toolbar.full = jQuery('<div id="midgard-bar"><div class="ui-widget-content"><div class="toolbarcontent"><div class="midgard-logo-button"><a id="midgard-bar-hidebutton" class="ui-widget-hidebut"></a></div><div class="toolbarcontent-left"></div><div class="toolbarcontent-center"></div><div class="toolbarcontent-right"></div></div></div>');
jQuery('body').append(midgardCreate.toolbar.full);
@

#### Hiding and displaying the toolbar

When the minimized toolbar is clicked we will display the full toolbar:

<<define toolbar>>=
midgardCreate.toolbar.minimized.bind('click', function() {
    midgardCreate.toolbar.show();
    return false;
});
@

And when the Midgard Create logo in the full toolbar is clicked we switch to the minimized toolbar:

<<define toolbar>>=
var hideButton = jQuery('#midgard-bar-hidebutton');
hideButton.bind('click', function() {
    midgardCreate.toolbar.hide();
    return false;
});
@

The toolbar showing method is wrapped into a function:

<<define toolbar>>=
midgardCreate.toolbar.show = function() {
   <<define toolbar show>>
}
@

And similarly the hiding method:

<<define toolbar>>=
midgardCreate.toolbar.hide = function() {
    <<define toolbar hide>>
}
@

Hiding the toolbar slides the full toolbar up outside of the screen and slides the minimized toolbar in, providing a smooth transition:

<<define toolbar hide>>=
midgardCreate.toolbar.full.slideToggle();
midgardCreate.toolbar.minimized.slideToggle();
@

Showing the toolbar slides the minimized toolbar up and the full toolbar down into the top of the screen:

<<define toolbar show>>=
midgardCreate.toolbar.minimized.slideToggle();
midgardCreate.toolbar.full.slideToggle();
@

#### Toolbar sessioning

When toolbar loads we will check from HTML5 SessionStorage whether the user had the toolbar minimized or shown fully. This way the toolbar will stay in same state between page loads:

<<define toolbar>>=
if (Modernizr.sessionstorage) {
    var toolbarState = sessionStorage.getItem('midgardmvc_ui_create_toolbar');
    if (toolbarState == 'minimized')
    {
        midgardCreate.toolbar.full.hide();
    }
    else
    {
        midgardCreate.toolbar.minimized.hide();
    }
}
@

If SessionStorage is not available we will default on the full toolbar being shown:

<<define toolbar>>=
else {
    midgardCreate.toolbar.minimized.hide();
}
@

As SessionStorage is not available in all browsers we use the Modernizr library for checking whether to use it or now:

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
@

When hiding the toolbar, we store the minimized state to HTML5 SessionStorage

<<define toolbar hide>>=
if (Modernizr.sessionstorage) {
    sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'minimized');
}
@

When showing the full toolbar, we store the state to HTML5 SessionStorage:

<<define toolbar show>>=
if (Modernizr.sessionstorage) {
    sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'full');
}
@

#### The full toolbar

To put things together, the toolbar defitions are called from a JavaScript file that is included into page when Midgard Create loads:

<<static/js/create.js>>=
/**
 * Midgard Create initialization
 */
<<notice about literate programming>>

// Include dependencies of Midgard Create
<<midgard create dependencies>>
<<midgard create dependencies ui>>

// Initialize Midgard Create
<<midgard create initialization>>
@

### Editables

To make content marked with appropriate RDFa mark-up editable, we need to include the Editables tool:

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/editable.js"></script>');
@

The Editables tool needs to be initialized to locate the editable areas:

<<initialize editables>>=
midgardCreate.Editable.init();
@

### Collections

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/containers.js"></script>');
@

<<initialize collections>>=
midgardCreate.Containers.init();
@

### Image handling

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/image.js"></script>');
@

<<initialize images>>=
midgardCreate.Image.init();
@

### Placed images

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/imageplaceholders.js"></script>');
@

<<initialize image placeholders>>=
midgardCreate.ImagePlaceholders.init();
@

## Development and contributing

Midgard Create is a free software library written in JavaScript and PHP5. It is managed in the Git distributed version control system.

### Reporting issues

Issues about Midgard Create can be reported to the GitHub interface in <https://github.com/bergie/midgardmvc_ui_create/issues>

### Literate programming

The library is developed using a hybrid model of [literate programming](http://en.wikipedia.org/wiki/Literate_programming) and regular coding. The parts that have been programmed using the literate model are managed in this document, and the code from them is extracted using the [noweb.php](https://github.com/bergie/noweb.php) tool. The resulting files will carry the following notice:

<<notice about literate programming>>=
/**
 * This file is generated automatically from Literate Programming code
 * stored in the README.txt documentation file in this repository.
 * Instead of modifying this file directly, modify the corresponding
 * code chunks in README.txt and regenerate it using the tangle command
 * of noweb.php:
 *
 *    $ noweb.php tangle README.txt
 *
 * Read more about the concept in:
 * @link http://bergie.iki.fi/blog/literate_programming_with_php/
 */
@
