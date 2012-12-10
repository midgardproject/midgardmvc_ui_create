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
    private $urlpattern = '';
    private $typeof = 'http://purl.org/dc/dcmitype/Collection';

    public function __get($key)
    {
        if ($key == 'urlpattern')
        {
            return $this->urlpattern;
        }

        if ($key == 'typeof')
        {
            return $this->typeof;
        }
    }

    public function attach($object, $data = null)
    {
        // We're attaching real objects to container, forget about placeholder
        if ($object == $this->placeholder)
        {
            $identifier = 'mgd:containerPlaceholder';
        }
        else
        {
            $identifier = null;
            if ($this->placeholder)
            {
                $this->detach($this->placeholder);
                $this->placeholder = null;
            }
        }

        if (!$object instanceof midgardmvc_ui_create_decorator)
        {
            // Add RDFmapper to the object
            $object = new midgardmvc_ui_create_decorator($object, $identifier);
        }

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

        $object = new midgardmvc_ui_create_decorator($object);

        $object->guid = 'placeholder';

        $this->placeholder = $object;
        $this->attach($object);
    }

    public function set_urlpattern($urlpattern)
    {
        if (!midgardmvc_ui_create_injector::can_use())
        {
            // URL Patterns only matter to Create users
            return;
        }

        $this->urlpattern = $urlpattern;
    }

    public function set_typeof($typeof)
    {
        $this->typeof = $typeof;
    }
}
