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
        if (!$object->delete())
        {
            throw new ezcWorkflowExecutionException('Failed to delete object');
        }
    }

    public function __toString()
    {
        return __CLASS__;
    }
}
