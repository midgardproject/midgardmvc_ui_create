<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Helper for handling object containers.
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_container extends SplObjectStorage
{
    private $placeholder = null;

    public function attach(midgard_object $object, $data = null)
    {
        // We're attaching real objects to container, forget about placeholder
        if ($this->placeholder)
        {
            $this->detach($this->placeholder);
            $this->placeholder = null;
        }

        // Add RDFmapper to the object
        $object->rdfmapper = new midgardmvc_ui_create_rdfmapper($object);

        parent::attach($object, $data);
    }

    /**
     * Add a placeholder object to be used in empty listings
     */
    public function set_placeholder(midgard_object $object)
    {
        if (count($this) > 0)
        {
            // We already have items, skip
            return;
        }

        if (!midgardmvc_ui_create_injector::can_use())
        {
            // Placeholders only matter to Create users
            return;
        }

        $this->attach($object);
        $this->placeholder = $object;
    }
}
