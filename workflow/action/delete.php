<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Deletion service object for workflows
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_workflow_action_delete implements ezcWorkflowServiceObject
{
    public function execute(ezcWorkflowExecution $execution)
    {
        $object = $execution->getVariable('object');
        $guid = $object->guid;
        if (!$this->delete_recursive($object))
        {
            throw new ezcWorkflowExecutionException('Failed to delete object: ' . midgard_connection::get_instance()->get_error_string());
        }

        if (!midgardmvc_core::get_instance()->authentication->is_user())
        {
            return;
        }

        $activity = new midgard_activity();
        $activity->actor = midgardmvc_core::get_instance()->authentication->get_person()->id;
        $activity->verb = 'http://community-equity.org/schema/1.0/delete';
        $activity->target = $guid;
        $activity->application = 'midgardmvc_ui_create';
        $activity->create();
    }

    private function delete_recursive(midgard_object $object)
    {
        if ($object->delete())
        {
            return true;
        }

        if (midgard_connection::get_instance()->get_error() != MGD_ERR_HAS_DEPENDANTS)
        {
            return false;
        }

        $object->delete_attachments(array());
        $object->delete_parameters(array());

        $child_classes = $this->get_child_types(get_class($object));
        foreach ($child_classes as $child_class)
        {
            $children = $object->list_children($child_class);
            foreach ($children as $child)
            {
                if (!$this->delete_recursive($child))
                {
                    return false;
                }
            }
        }
        return $object->delete();
    }

    private function get_child_types($parent_class)
    {
        $mgdschemas = midgardmvc_core::get_instance()->dispatcher->get_mgdschema_classes();
        $child_types = array();
        foreach ($mgdschemas as $mgdschema)
        {
            if (   $mgdschema == 'midgard_attachment'
                || $mgdschema == 'midgard_parameter')
            {
                continue;
            }

            $link_properties = array
            (
                'parent' => midgard_object_class::get_property_parent($mgdschema),
                'up' => midgard_object_class::get_property_up($mgdschema),
            );

            $ref = new midgard_reflection_property($mgdschema);
            foreach ($link_properties as $type => $property)
            {
                $link_class = $ref->get_link_name($property);
                if (   empty($link_class)
                    && $ref->get_midgard_type($property) === MGD_TYPE_GUID)
                {
                    $child_types[] = $mgdschema;
                    continue;
                }

                if ($link_class == $parent_class)
                {
                    $child_types[] = $mgdschema;
                }
            }
        }
        return $child_types;
    }

    public function __toString()
    {
        return __CLASS__;
    }
}
