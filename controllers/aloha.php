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

    public function get_state_new(array $args)
    {
        $mgdschema = midgardmvc_ui_create_rdfmapper::typeof_to_class(rawurldecode($args['type']));
        $object = $this->prepare_new_object($mgdschema);

        $this->data['object'] = array();
        $this->data['object']['type'] = $this->get_type_label($mgdschema);
        $this->data['state'] = array();
        $this->data['state']['current'] = 'new';
        $this->data['state']['history'] = array();
        $this->data['state']['actions'] = array();
    }

    public function get_state(array $args)
    {
        $mgdschema = midgardmvc_ui_create_rdfmapper::typeof_to_class(rawurldecode($args['type']));
        $this->load_object($mgdschema, rawurldecode($args['identifier']));

        $this->data['object'] = array();
        $this->data['object']['type'] = $this->get_type_label($mgdschema);
        $this->data['state'] = array();
        // TODO: Read state from workflow system
        $this->data['state']['current'] = 'live';
        $this->data['state']['history'] = array();
        $this->data['state']['actions'] = array();

        $actions = $this->get_workflows_for_object($this->object);
        foreach ($actions as $name => $workflow)
        {
            $this->data['state']['actions'][$name] = $workflow['label'];
        }
    }

    public function post_run(array $args)
    {
        $mgdschema = midgardmvc_ui_create_rdfmapper::typeof_to_class(rawurldecode($args['type']));
        $this->load_object($mgdschema, rawurldecode($args['identifier']));

        $workflows = $this->get_workflows_for_object($this->object);
        if (!isset($workflows[$args['workflow']]))
        {
            throw new midgardmvc_exception_notfound("Workflow {$args['workflow']} not defined");
        }

        midgardmvc_core::get_instance()->component->load_library('Workflow');

        $workflow_class = $workflows[$args['workflow']]['provider'];
        $workflow = new $workflow_class();
        if (!$workflow->can_handle($this->object))
        {
            throw new midgardmvc_exception_notfound("Workflow {$args['workflow']} cannot handle this object");
        }

        $values = $workflow->run($this->object);
        foreach ($values as $key => $value)
        {
            $this->data[$key] = $value;
        }
    }

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

    private function get_workflows_for_object(midgard_object $object)
    {
        $workflows = midgardmvc_core::get_instance()->configuration->workflows;
        $object_workflows = array();
        foreach ($workflows as $workflow_name => $workflow)
        {
            $wf_class = $workflow['provider'];
            $wf = new $wf_class();

            if (!$wf instanceof midgardmvc_ui_create_workflow)
            {
                throw new Exception("Invalid workflow definition {$workflow_name}: {$wf_class} doesn't implement midgardmvc_ui_create_workflow");
            }

            if (!$wf->can_handle($object))
            {
                continue;
            }

            $object_workflows[$workflow_name] = array
            (
                'label' => $workflow['label'],
                'provider' => $wf_class,
            );
        }
        return $object_workflows;
    }

    private function get_type_label($mgdschema)
    {
        $parts = explode('_', $mgdschema);
        return $parts[count($parts) - 1];
    }

    private function process_form($mgdschema)
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

        try
        {
            $this->object = new $mgdschema($guid);
        }
        catch (midgard_error_exception $e)
        {
            throw new midgardmvc_exception_notfound("Object {$guid}: " . $e->getMessage());
        }
    }
    
    public function prepare_new_object($mgdschema)
    {
        $this->object = new $mgdschema();
    }
}
?>
