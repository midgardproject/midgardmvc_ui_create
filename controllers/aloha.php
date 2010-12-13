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
        $mgdschema = $this->get_class($_POST['type']);
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

        // Process with form
        $this->form = midgardmvc_helper_forms::create($mgdschema);
        try
        {
            $this->process_form($mgdschema);
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

    public function process_form($mgdschema)
    {
        $property_map = array();
        foreach ($_POST as $property => $value)
        {
            $property_map[$property] = $this->map_property($mgdschema, $property);
            midgardmvc_helper_forms_mgdschema::property_to_form($mgdschema, $mgd_property, $this->object->$mgd_property, $this->form, $property);
        }
        $this->form->process_post();
        foreach ($_POST as $property => $value)
        {
            $mgd_property = $property_map[$property];
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

    private function get_namespace_map($type)
    {
        static $nsmap = array();
        if (isset($nsmap[$type]))
        {
            return $nsmap[$type];
        }

        $mgdschemas = midgardmvc_core::get_instance()->dispatcher->get_mgdschema_classes();
        if (!in_array($type, $mgdschemas))
        {
            throw new midgardmvc_exception_notfound("Type {$type} is not a registered MgdSchema");
        }

        $nsmap[$type] = array
        (
            'mgd' => 'http://www.midgard-project.org/midgard2/9.03',
        );

        $reflector = new midgard_reflection_class($type);
        $namespaces = $reflector->get_user_value('namespaces');
        if (empty($namespaces))
        {
            // Type didn't register additional namespaces
            return $nsmap[$type];
        }

        $namespaces = explode(',', $namespaces);
        foreach ($namespaces as $namespace)
        {
            $namespace_parts = explode(':', $namespace, 2);
            $nsmap[$type][$namespace_parts[0]] = $namespace_parts[1];
        }

        return $nsmap[$type];
    }

    private function map_property($mgdschema, $property)
    {
        static $property_map = array();
        if (!isset($property_map[$mgdschema]))
        {
            $property_map[$mgdschema] = array();
        }

        $nsmap = $this->get_namespace_map($mgdschema);
        $reflector = new midgard_reflection_class($mgdschema);
        $props = $reflector->getProperties();
        foreach ($props as $prop)
        {
            if ($property == $prop->name)
            {
                // Straight match
                $property_map[$mgdschema][$property] = $prop->name;
                break 1;
            }

            $property_reflector = new midgard_reflection_property($mgdschema);
            $namespaced_property = $property_reflector->get_user_value($prop->name, 'property');
            if (empty($namespaced_property))
            {
                // No namespaced property mappings
                continue;
            }

            foreach ($nsmap as $prefix => $url)
            {
                if (substr($property, 0, strlen($url)) == $url)
                {
                    $property_map[$mgdschema][$property] = $prop->name;
                    break 2;
                }
                echo substr($property, 0, strlen($url));

                $prefix_colon = "{$prefix}:";
                if (substr($property, 0, strlen($prefix_colon)) == $prefix_colon)
                {
                    $property_map[$mgdschema][$property] = $prop->name;
                    break 2;
                }
                die(substr($property, 0, strlen($prefix_colon)));
            }
        }

        if (!isset($property_map[$mgdschema][$property]))
        {
            var_dump($property_map);
            die();
            throw new midgardmvc_exception_notfound("Unable to map {$property} to a property of {$mgdschema}");
        }

        return $property_map[$mgdschema][$property];
    }

    private function get_class($type)
    {
        $mgdschemas = midgardmvc_core::get_instance()->dispatcher->get_mgdschema_classes();
        if (substr($type, 0, 4) == 'mgd:')
        {
            // Straight reference to a MgdSchema type
            $class = $this->clean_namespace($type);
            if (!in_array($class, $mgdschemas))
            {
                throw new midgardmvc_exception_notfound("Class {$class} is not a MgdSchema type");
            }
            return $class;
        }

        // Check for RDF type match
        foreach ($mgdschemas as $mgdschema)
        {
            $reflector = new midgard_reflection_class($mgdschema);
            if ($reflector->get_user_value('typeof') == $type)
            {
                return $mgdschema;
            }
        }

        throw new midgardmvc_exception_notfound("Unrecognized MgdSchema type {$class}");
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
