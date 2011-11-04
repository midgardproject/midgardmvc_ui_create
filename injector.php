<?php
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
class midgardmvc_ui_create_injector
{
    public function inject_process(midgardmvc_core_request $request)
    {
        // Ensure authorization service is loaded
        midgardmvc_core::get_instance()->authorization;

        // Register URL handlers
        $request->add_component_to_chain(midgardmvc_core::get_instance()->component->get('midgardmvc_ui_create'));
        if (midgardmvc_core::get_instance()->context->get_current_context() != 0)
        {
            return;
        }
        if (!self::can_use())
        {
            return;
        }

        midgardmvc_core::get_instance()->head->enable_jquery();
        midgardmvc_core::get_instance()->head->enable_jquery_ui();
        midgardmvc_core::get_instance()->head->add_jsfile(MIDGARDMVC_STATIC_URL . '/midgardmvc_ui_create/js/init.js');

        midgardmvc_core::get_instance()->head->add_link
        (
            array
            (
                'rel' => 'stylesheet',
                'type' => 'text/css',
                'href' => MIDGARDMVC_STATIC_URL . '/create/deps/hallo/vader/jquery-ui-1.8.16.custom.css'
            )
        );

        midgardmvc_core::get_instance()->head->add_link
        (
            array
            (
                'rel' => 'stylesheet',
                'type' => 'text/css',
                'href' => MIDGARDMVC_STATIC_URL . '/create/themes/midgard-theme/jquery.ui.all.css'
            )
        );

        midgardmvc_core::get_instance()->head->add_link
        (
            array
            (
                'rel' => 'stylesheet',
                'type' => 'text/css',
                'href' => MIDGARDMVC_STATIC_URL . '/create/themes/midgard-toolbar/midgardbar.css'
            )
        );
    }

    public function can_use()
    {
        if (!midgardmvc_core::get_instance()->authentication->is_user())
        {
            return false;
        }
        if (midgardmvc_core::get_instance()->authentication->get_user()->usertype == MIDGARD_USER_TYPE_USER)
        {
            // We distinquish between CMS users and end-users by ADMIN vs. USER level
            return false;
        }
        return true;
    }
}
