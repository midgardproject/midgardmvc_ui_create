Midgard Create
==============

Midgard Create is a web editing tool (commonly known as [Content Management System](http://en.wikipedia.org/wiki/Content_management_system)) that allows users to manage all their web content within a browser-based interface.

## Interaction components

The user interaction concept implemented by Midgard Create is based on easy discoverability, and the ability to manage all content shown on a web page.

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

Simple article example:

    <article about="urn:uuid:b22842f81e3511e08dcec7b8cfa942754275" typeof="http://rdfs.org/sioc/ns#Post"> 
        <h1 property="dcterms:title">Article title</h1>
        <div property="sioc:content">
            <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
        </div> 
    </article> 

### Collections

In addition to individual content items, Midgard Create can also be used to manage Collections of them. With Collections the user interface provides functionality for adding new items of the type managed by a Collection.

Article listing example:

    <ol mgd:type="container" mgd:order="desc" mgd:baseurl="/news/"> 
        <li>
            <article about="urn:uuid:b22842f81e3511e08dcec7b8cfa942754275" typeof="http://rdfs.org/sioc/ns#Post">
                <h3 property="dcterms:title">Article title</h3>
            </article>
        </li>
    </ol>

### Placed images

### Workflows

## System architecture

Midgard Create builds on a robust basis of web system components to keep the codebase clean, maintainable and simple. The system architecture of Midgard Create is the following:

* Content Repository: [Midgard2](http://midgard2.org) is used for all persistent content storage and retrieval
* Web framework: [Midgard MVC](https://github.com/midgardproject/midgardmvc_core/blob/master/documentation/index.markdown) provides a model-view-controller framework for PHP
* Server-side scripting language: [PHP5](http://php.net/) is used for building the server-side functionality
* Client-side scripting language: JavaScript with the [jQuery](http://jquery.com/) library is used for client-side scripting
* User interface: the [jQuery UI](http://jqueryui.com/) library is used for rendering the Midgard Create user interfaces
* HTML5 editor: [Aloha Editor](http://aloha-editor.org/) is used for content editing
* Workflow system: [Zeta Components Workflow](http://incubator.apache.org/zetacomponents/documentation/trunk/Workflow/tutorial.html) is used for server-side workflow definitions
