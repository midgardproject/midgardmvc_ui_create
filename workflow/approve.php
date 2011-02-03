<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Workflow definition for approving objects
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_workflow_approve implements midgardmvc_helper_workflow_definition
{
    public function can_handle(midgard_object $object)
    {
        if ($object->is_approved())
        {
            return false;
        }

        if (midgardmvc_core::get_instance()->authorization->can_do('mgd:approve', $object))
        {
            return true;
        }
        return false;
    }

    public function get()
    {
        $workflow = new ezcWorkflow('approve');

        $getObject = new ezcWorkflowNodeInput
        (
            array
            (
                'object' => new ezcWorkflowConditionIsObject()
            )
        );
         
        $approveObject = new ezcWorkflowNodeAction
        (
            array
            (
                'class' => 'midgardmvc_ui_create_workflow_action_approve'
            )
        );

        // Define steps
        $workflow->startNode->addoutNode($getObject);
        $getObject->addOutNode($approveObject);
        $approveObject->addoutNode($workflow->endNode);

        return $workflow;
    }

    public function run(midgard_object $object, array $args = null)
    {
        $workflow = $this->get();

        $execution = new midgardmvc_helper_workflow_execution_interactive($workflow);
        $execution->setVariable('object', $object);
        $execution->start();

        $values = array();
        $values['object'] = 'keep';
        if (!$execution->hasEnded())
        {
            $values['status'] = 'failure';
        }
        $values['status'] = 'ok';
        return $values;
    }
}
