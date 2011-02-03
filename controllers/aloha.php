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
        $this->object = midgardmvc_ui_create_rdfmapper::load_object(rawurldecode($args['type']));

        $this->data['object'] = array();
        $this->data['object']['type'] = $this->get_type_label(get_class($this->object));
        $this->data['state'] = array();
        $this->data['state']['current'] = 'new';
        $this->data['state']['history'] = array();
        $this->data['state']['actions'] = array();
    }

    private function get_actor($person_id)
    {
        static $actors = array();
        if (!isset($actors[$person_id]))
        {
            $actors[$person_id] = new midgard_person();
            $actors[$person_id]->get_by_id($person_id);
        }
        return $actors[$person_id];
    }

    public function get_state(array $args)
    {
        $this->object = midgardmvc_ui_create_rdfmapper::load_object(rawurldecode($args['type']), rawurldecode($args['identifier']));

        $this->data['object'] = array();
        $this->data['object']['type'] = $this->get_type_label(get_class($this->object));
        $this->data['state'] = array();
        // TODO: Read state from workflow system
        $this->data['state']['current'] = 'live';

        $this->data['state']['history'] = array();
        $qb = new midgard_query_builder('midgard_activity');
        $qb->add_constraint('target', '=', $this->object->guid);
        $qb->add_order('metadata.revised', 'DESC');
        $logs = $qb->execute();
        foreach ($logs as $log)
        {
            $actor = $this->get_actor($log->actor);
            $this->data['state']['history'][] = array
            (
                'actor' => array
                (
                    'firstname' => $actor->firstname,
                    'lastname' => $actor->lastname,
                    'guid' => $actor->guid,
                ),
                'verb' => $log->verb,
                'time' => $log->metadata->created->format(DateTime::ISO8601),
            );
        }

        $this->data['state']['actions'] = array();

        $actions = $this->get_workflows_for_object($this->object);
        foreach ($actions as $name => $workflow)
        {
            $this->data['state']['actions'][$name] = $workflow['label'];
        }
    }

    public function post_run(array $args)
    {
        $this->object = midgardmvc_ui_create_rdfmapper::load_object(rawurldecode($args['type']), rawurldecode($args['identifier']));

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

    private function get_workflows_for_object(midgard_object $object)
    {
        $workflows = midgardmvc_core::get_instance()->configuration->workflows;
        $object_workflows = array();
        foreach ($workflows as $workflow_name => $workflow)
        {
            $wf_class = $workflow['provider'];
            $wf = new $wf_class();

            if (!$wf instanceof midgardmvc_helper_workflow_definition)
            {
                throw new Exception("Invalid workflow definition {$workflow_name}: {$wf_class} doesn't implement midgardmvc_helper_workflow_definition");
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
}
?>
