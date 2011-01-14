<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Workflow definition interface for Midgard Create
 *
 * @package midgardmvc_ui_create
 */
interface midgardmvc_ui_create_workflow
{
    public function can_handle(midgard_object $object);

    public function run(midgard_object $object, array $args = null);
}
