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
class midgardmvc_ui_create_controllers_backbone
{
    private $context_switched = false;
    private $rdfmapper = null;
    private $object = null;
    private $form = null;
    private $baseurl = null;

    public function load_object(array $args)
    {
        $mgdschema = rawurldecode($args['type']);
        $form_identifier = $mgdschema;
        $identifier = null;
        if (isset($args['identifier']))
        {
            $identifier = rawurldecode($args['identifier']);
            $form_identifier .= $identifier;
        }
        $this->object = midgardmvc_ui_create_rdfmapper::load_object($mgdschema, $identifier);
        $this->rdfmapper = new midgardmvc_ui_create_rdfmapper($this->object);
    }

    public function get_object(array $args)
    {
        $this->load_object($args);
        $this->object_to_json();
    }

    public function post_object(array $args)
    {
        $this->load_object($args);
        $data = $this->read_input();
        if ($this->object->guid)
        {
            throw new midgardmvc_exception_notfound("POST is only used for creating new objects");
        }

        $this->populate_object($data);

        $transaction = new midgard_transaction();
        $transaction->begin();

        $this->enter_context();
        $this->object->create();
        $this->leave_context();

        // Refresh object
        $this->object = midgard_object_class::get_object_by_guid($this->object->guid);
        $this->rdfmapper = new midgardmvc_ui_create_rdfmapper($this->object);

        $this->log_activity('http://activitystrea.ms/schema/1.0/post');
        $transaction->commit();

        $this->object_to_json();
    }

    public function put_object(array $args)
    {
        $this->load_object($args);
        $data = $this->read_input();
        if (!$this->object->guid)
        {
            throw new midgardmvc_exception_notfound("PUT is only used for updating existing objects");
        }
        $this->populate_object($data);

        $transaction = new midgard_transaction();
        $transaction->begin();

        $this->enter_context();
        $this->object->update();
        $this->leave_context();

        $this->log_activity('http://activitystrea.ms/schema/1.0/post');
        $transaction->commit();

        $this->object_to_json();
    }

    private function log_activity($verb)
    {
        if (!midgardmvc_core::get_instance()->authentication->is_user())
        {
            return;
        }

        $activity = new midgard_activity();
        $activity->actor = midgardmvc_core::get_instance()->authentication->get_person()->id;
        $activity->verb = $verb;
        $activity->target = $this->object->guid;
        $activity->application = 'midgardmvc_ui_create';
        $activity->create();
    }

    private function populate_object(stdClass $data)
    {
        $form = midgardmvc_helper_forms_mgdschema::create($this->object, false);
        foreach ($data as $property => $value)
        {
            $mgd_property = $this->rdfmapper->__get($property);
            if (!isset($form->$mgd_property))
            {
                continue;
            }
            $form->$mgd_property->set_value($value);
            $form->$mgd_property->validate();
            $form->$mgd_property->clean();
            $this->object->$mgd_property = $form->$mgd_property->get_value();
        }
    }

    private function enter_context()
    {
        if (!$this->baseurl)
        {
            return;
        }

        // BaseURL set, create appropriate context so injectors can function properly
        $request = midgardmvc_core_request::get_for_intent($this->baseurl);
        $request->add_component_to_chain(midgardmvc_core::get_instance()->component->get('midgardmvc_core'));
        midgardmvc_core::get_instance()->context->create($request);
        midgardmvc_core::get_instance()->component->inject($request, 'process');
        $this->context_switched = true;
    }

    private function leave_context()
    {
        if (!$this->context_switched)
        {
            return;
        }
        midgardmvc_core::get_instance()->context->delete();
    }

    private function read_input()
    {
        if (isset($_POST['model']))
        {
            // Backbone.emulateJSON is set
            $data = json_decode($_POST['model']);
        }
        else
        {
            $data = json_decode(file_get_contents('php://input'));
        }

        if (isset($data->id))
        {
            unset($data->id);
        }

        if (isset($data->baseurl))
        {
            $this->baseurl = $data->baseurl;
            unset($data->baseurl);
        }

        return $data;
    }

    private function object_to_json()
    {
        $this->data = array
        (
            'id' => $this->rdfmapper->about,
        );
        $skip = array
        (
            'id',
            'guid',
            'metadata',
            'connection',
            'action',
        );
        foreach ($this->object as $property => $value)
        {
            if (in_array($property, $skip))
            {
                continue;
            }

            $rdf_property = $this->rdfmapper->$property;
            $this->data[$rdf_property] = $value;
        }
    }
}
