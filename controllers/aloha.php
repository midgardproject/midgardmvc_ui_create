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
        if (isset($args['guid']))
        {
            $this->load_object($args);
            midgardmvc_core::get_instance()->authorization->require_do('midgard:update', $this->object);
        }
        else
        {
            $this->prepare_new_object($args);
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

        // Process with form
        $this->form = midgardmvc_helper_forms::create($args['type']);
        try
        {
            $this->process_form();
            if ($this->object->guid)
            {
                $this->object->update();
            }
            else
            {
                $this->object->create();
            }
            $this->data['status'] = array
            (
                'status' => 'ok',
                'message' => midgardmvc_core::get_instance()->dispatcher->get_midgard_connection()->get_error_string(),
            );
        }
        catch (midgardmvc_helper_forms_exception_validation $e)
        {
            midgardmvc_core::get_instance()->dispatcher->header("HTTP/1.0 500 Internal Server Error");
            $this->data['status'] = array
            (
                'status' => 'error',
                'message' => $e->getMessage(),
            );
        }
    }

    public function process_form()
    {
        foreach ($_POST as $property => $value)
        {
            if (!property_exists($this->object, $property))
            {
                throw new InvalidArgumentException(get_class($this->object) . " objects don't have property {$property}");
            }

            midgardmvc_helper_forms_mgdschema::property_to_form(get_class($this->object), $property, $this->object->$property, $this->form);
        }
        $this->form->process_post();
        foreach ($_POST as $property => $value)
        {
            $this->object->$property = $this->form->$property->get_value();
        }
    }

    public function load_object(array $args)
    {
        $class = $args['type'];
        if (!class_exists($class))
        {
            throw new midgardmvc_exception_notfound("{$class} is not installed");
        }
        $mgdschemas = midgardmvc_core::get_instance()->dispatcher->get_mgdschema_classes();
        if (!in_array($class, $mgdschemas))
        {
            throw new midgardmvc_exception_notfound("{$class} is not a Midgard type");
        }
        $this->object = new $class($args['guid']);
    }
    
    public function prepare_new_object(array $args)
    {
        $class = $args['type'];
        if (!class_exists($class))
        {
            throw new midgardmvc_exception_notfound("{$class} is not installed");
        }
        $instance = new $class();
        if (!$instance instanceof midgard_object)
        {
            throw new midgardmvc_exception_notfound("{$class} is not a Midgard type");
        }
        unset($instance);
        $this->object = new $class();
    }
}
?>
