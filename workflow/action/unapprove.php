<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Unapproval service object for workflows
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_workflow_action_unapprove implements ezcWorkflowServiceObject
{
    public function execute(ezcWorkflowExecution $execution)
    {
        $object = $execution->getVariable('object');
        $guid = $object->guid;
        if (!$object->unapprove())
        {
            throw new ezcWorkflowExecutionException('Failed to unapprove object');
        }

        if (!midgardmvc_core::get_instance()->authentication->is_user())
        {
            return;
        }

        $activity = new midgard_activity();
        $activity->actor = midgardmvc_core::get_instance()->authentication->get_person()->id;
        $activity->verb = 'http://www.midgard-project.org/verbs/unapprove';
        $activity->target = $guid;
        $activity->application = 'midgardmvc_ui_create';
        $activity->create();
    }

    public function __toString()
    {
        return __CLASS__;
    }
}
