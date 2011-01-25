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

Midgard Create consists of two sides: server-side functionality implemented in PHP5 using the Midgard MVC framework, and client-side functionality implemented in JavaScript and jQuery.

### Server-side initialization of Midgard Create

On the server side, Midgard Create is implemented as a Midgard MVC injector, meaning that it will be automatically loaded on every page:

<<injector.php>>=
<?php
<<notice about literate programming>>
class midgardmvc_ui_create_injector
{
    public function inject_process(midgardmvc_core_request $request)
    {
        <<midgard create injector>>
    }

    public function can_use()
    {
        <<midgard create permissions check>>
    }
}
@

When loaded, Midgard Create will add itself to the component chain in order to be able to intercept requests to its own routes and to load some additional configurations:

<<midgard create injector>>=
// Register URL handlers
$request->add_component_to_chain(midgardmvc_core::get_instance()->component->get('midgardmvc_ui_create'));
@

Then we check whether the request being injected is the main request (i.e. the request sent by a browser):

<<midgard create injector>>=
if (midgardmvc_core::get_instance()->context->get_current_context() != 0)
{
    return;
}
@

If this is accepted we check whether user is allowed to use the Midgard Create UI:

<<midgard create injector>>=
if (!self::can_use())
{
    return;
}
@

The actual user interaction is implemented in the included JavaScript with jQuery and jQuery UI. For this, we load jQuery UI and our own initialization file:

<<midgard create injector>>=
midgardmvc_core::get_instance()->head->enable_jquery();
midgardmvc_core::get_instance()->head->add_jsfile(MIDGARDMVC_STATIC_URL . '/midgardmvc_core/jQuery/jquery-ui-1.8.7.min.js');
midgardmvc_core::get_instance()->head->add_jsfile(MIDGARDMVC_STATIC_URL . '/midgardmvc_ui_create/js/create.js');
@

### Client-side initialization of Midgard Create

All Midgard Create JavaScript functionality resides under a `midgardCreate` object. When Midgard Create is loaded we define it:

<<define midgardCreate>>=
if (typeof midgardCreate == 'undefined') {
    midgardCreate = {};
}
@

Client-side initialization of Midgard Create is handled inside a jQuery callback that is run when the page load is completed:

<<midgard create initialization>>=
jQuery(document).ready(function() {
    <<define midgardCreate>>
    <<define capability check>>
    <<define effects>>
    <<define toolbar>>
    <<initialize objectmanager>>
    <<initialize collections>>
    <<initialize images>>
    <<initialize image placeholders>>
    <<initialize editables>>
});
@

### Permissions and browser capabilities

There are two levels of enabling Midgard Create for users: permissions and browser capabilities. Permissions is a mechanism for checking whether a user is allowed to use Midgard Create at all, and browser capabilities determine what Midgard Create features are available to the user.

#### Midgard Create usage permissions

The first check with Midgard Create permissions is whether the current user has a valid session. Only authenticated users are allowed to use Midgard Create. These permission checks are run on the server side:

<<midgard create permissions check>>=
if (!midgardmvc_core::get_instance()->authentication->is_user())
{
    return false;
}
@

The other check is about user levels. Midgard Content Repository users can be either _end users_ or _admins_. End users are generally registered users of a site that don't have access to content management features.

<<midgard create permissions check>>=
if (midgardmvc_core::get_instance()->authentication->get_user()->usertype == MIDGARD_USER_TYPE_USER)
{
    // We distinquish between CMS users and end-users by ADMIN vs. USER level
    return false;
}
@

If both of these checks pass, then we have a valid login session for an Admin-level user. This means Midgard Create can be enabled:

<<midgard create permissions check>>=
return true;
@

#### Browser capabilities

In addition to permissions of the user, also the capabilities of the browser being used matter. Some mobile or legacy browsers do not support Rich Text Editing, for instance, and in these situations we should not enable the editing functionality at all.

Capabilities checks are handled via the Midgard Create capability check method:

<<define capability check>>=
midgardCreate.checkCapability = function(capability) {
    if (capability == 'contentEditable') {
        <<capability check for editables>>
    }
    if (capability == 'fileUploads') {
        <<capability check for uploads>>
    }
    <<capability checks with modernizr>>
};
@

For most HTML5 capabilities we use the [Modernizr](http://www.modernizr.com/) library. This needs to be included into Midgard Create:

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/deps/modernizr-1.6.min.js"></script>');
@

The actual Modernizr checks are quite simple:

<<capability checks with modernizr>>=
return Modernizr[capability];
@

There are however some HTML5 capabilities not covered by Modernizr. For these we have our own custom checks.

##### Rich Text Editing

Mobile WebKit as implemented on iOS devices like iPhones and iPads, and most Android phones doesn't support Rich Text Editing. See the [Apple TechNote about this](http://developer.apple.com/library/safari/#technotes/tn2010/tn2262/#//apple_ref/doc/uid/DTS40009577-CH1-DontLinkElementID_7). Therefore we disable contentEditable for these devices:

<<capability check for editables>>=
if (navigator.userAgent.match(/iPhone/i)) {
    return false;
}
if (navigator.userAgent.match(/iPod/i)) {
    return false;
}
if (navigator.userAgent.match(/iPad/i)) {
    return false;
}
return true;
@

##### File uploads

Most desktop browsers are able to upload files to a website. On mobile devices the picture is a bit more varied, with iOS devices for example unable to access locally stored files because of application sandboxing. This means file uploads should be disabled for those devices:

<<capability check for uploads>>=
if (navigator.userAgent.match(/iPhone/i)) {
    return false;
}
if (navigator.userAgent.match(/iPod/i)) {
    return false;
}
if (navigator.userAgent.match(/iPad/i)) {
    return false;
}
@

With other browsers we simply check for whether the necessary HTML5 features are enabled:

<<capability check for uploads>>=
if (typeof FileReader == 'undefined') {
    return false;
}
if (typeof FormData == 'undefined') {
    return false;
}
return Modernizr.draganddrop;
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

The toolbar relies on a Midgard jQuery UI theme and its own additional CSS rules:

<<midgard create dependencies>>=
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-theme/jquery.ui.all.css">');
document.write('<link rel="stylesheet" href="/midgardmvc-static/midgardmvc_ui_create/themes/midgard-toolbar/midgardbar.css">');
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
if (midgardCreate.checkCapability('sessionstorage')) {
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

When hiding the toolbar, we store the minimized state to HTML5 SessionStorage

<<define toolbar hide>>=
if (midgardCreate.checkCapability('sessionstorage')) {
    sessionStorage.setItem('midgardmvc_ui_create_toolbar', 'minimized');
}
@

When showing the full toolbar, we store the state to HTML5 SessionStorage:

<<define toolbar show>>=
if (midgardCreate.checkCapability('sessionstorage')) {
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

// Initialize Midgard Create
<<midgard create initialization>>
@

### Object manager

All objects shown on Midgard Create pages are managed by the Midgard Create Object manager, which uses functionality from backbone.js to handle saving and other operations to them.

<<midgard create dependencies>>=
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/objectmanager.js"></script>');
@

<<initialize objectmanager>>=
midgardCreate.objectManager.init();
@

### Editables

The Editable functionality in Midgard Create is implemented using [Aloha Editor](http://aloha-editor.com).

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
document.write('<script type="text/javascript" src="/midgardmvc-static/midgardmvc_ui_create/js/collections.js"></script>');
@

<<initialize collections>>=
midgardCreate.Collections.init();
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
