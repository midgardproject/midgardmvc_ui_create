<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Content management controller
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_controllers_aloha
{
    private $object = null;
    private $parent = null;
    private $form = null;

    public function post_save(array $args)
    {
        if (!isset($_POST['type']))
        {
            throw new midgardmvc_exception_notfound("No type provided");
        }
        $mgdschema = midgardmvc_ui_create_rdfmapper::typeof_to_class($_POST['type']);
        unset($_POST['type']);

        if (isset($_POST['identifier']))
        {
            $this->load_object($mgdschema, $_POST['identifier']);
            unset($_POST['identifier']);
            midgardmvc_core::get_instance()->authorization->require_do('midgard:update', $this->object);
        }
        else
        {
            $this->prepare_new_object($mgdschema);
            if (isset($this->parent))
            {
                midgardmvc_core::get_instance()->authorization->require_do('midgard:create', $this->parent);
            }
            else
            {
                // Independent object, check permissions directly
                midgardmvc_core::get_instance()->authorization->require_do('midgard:create', $this->object);
            }
        }

        $baseurl = null;
        if (isset($_POST['baseurl']))
        {
            if (strpos($_POST['baseurl'], '/') !== false)
            {
                $baseurl = $_POST['baseurl'];
            }
            unset($_POST['baseurl']);
        }

        // Process with form
        $this->form = midgardmvc_helper_forms::create("{$mgdschema}_{$this->object->guid}");
        try
        {
            $this->process_form($mgdschema);

            if ($baseurl)
            {
                // BaseURL set, create appropriate context so injectors can function properly
                $request = midgardmvc_core_request::get_for_intent($baseurl);
                midgardmvc_core::get_instance()->context->create($request);
                midgardmvc_core::get_instance()->component->inject($request, 'process');
            }

            if ($this->object->guid)
            {
                $this->object->update();
            }
            else
            {
                $this->object->create();
            }

            if ($baseurl)
            {
                midgardmvc_core::get_instance()->context->delete();
            }

            $this->data['status'] = array
            (
                'status' => 'ok',
                'message' => midgardmvc_core::get_instance()->dispatcher->get_midgard_connection()->get_error_string(),
                'identifier' => "urn:uuid:{$this->object->guid}",
            );
        }
        catch (midgardmvc_helper_forms_exception_validation $e)
        {
            if ($baseurl)
            {
                midgardmvc_core::get_instance()->context->delete();
            }

            midgardmvc_core::get_instance()->dispatcher->header("HTTP/1.0 500 Internal Server Error");
            $this->data['status'] = array
            (
                'status' => 'error',
                'message' => $e->getMessage(),
            );
        }
    }

    public function process_form($mgdschema)
    {
        $mapper = new midgardmvc_ui_create_rdfmapper($mgdschema);
        foreach ($_POST as $property => $value)
        {
            $mgd_property = $mapper->__get($property);
            midgardmvc_helper_forms_mgdschema::property_to_form($mgdschema, $mgd_property, $this->object->$mgd_property, $this->form, $property);
        }
        $this->form->process_post();
        foreach ($_POST as $property => $value)
        {
            $mgd_property = $mapper->__get($property);
            $this->object->$mgd_property = $this->form->items[$property]->get_value();
        }
    }

    private function clean_namespace($identifier)
    {
        if (substr($identifier, 0, 4) == 'mgd:')
        {
            return substr($identifier, 4);
        }
        if (substr($identifier, 0, 9) == 'urn:uuid:')
        {
            return substr($identifier, 9);
        }
        return $identifier;
    }

    public function load_object($mgdschema, $guid)
    {
        $guid = $this->clean_namespace($guid);
        $this->object = new $mgdschema($guid);
    }
    
    public function prepare_new_object($mgdschema)
    {
        $this->object = new $mgdschema();
    }
}
?>
