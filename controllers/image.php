<?php
class midgardmvc_ui_create_controllers_image extends midgardmvc_helper_attachmentserver_controllers_upload
{
    public function __construct(midgardmvc_core_request $request)
    {
        $this->request = $request;

        $this->variants = midgardmvc_core::get_instance()->configuration->attachmentserver_variants;
    }

    public function get_search(array $args)
    {
        $qb = new midgard_query_builder('midgard_attachment');
        if (   isset($args['searchterm'])
            && !empty($args['searchterm']))
        {
            $qb->begin_group('OR');
            $qb->add_constraint('name', 'LIKE', "{$args['searchterm']}%");
            $qb->add_constraint('title', 'LIKE', "{$args['searchterm']}%");
            $qb->end_group();
        }
        else
        {
            $qb->set_limit(10);
        }
        $qb->add_constraint('mimetype', 'LIKE', 'image/%');
        $qb->add_order('metadata.revised', 'DESC');
        $attachments = $qb->execute();

        $this->data = array();
        foreach ($attachments as $attachment)
        {
            try {
                $parent = midgard_object_class::get_object_by_guid($attachment->parentguid);
            }
            catch (midgard_error_exception $e)
            {
                continue;
            }
            if (  $parent instanceof midgard_attachment
                || $parent instanceof midgardmvc_helper_attachmentserver_attachment)
            {
                continue;
            }
            
            $this->data[] = $this->attachment_to_data($attachment);
        }
    }

    private function attachment_to_data($attachment)
    {
        $data = array
        (
            'id' => $attachment->guid,
            'parentguid' => $attachment->parentguid,
            'name' => $attachment->name,
            'title' => $attachment->title,
            'size' => $attachment->metadata->size,
            'displayURL' => "/mgd:attachment/{$attachment->guid}/{$attachment->name}",
        );

        $data['variants'] = array();
        foreach ($this->variants as $variant => $config)
        {
            $data['variants'][$variant] = $variant;
        }

        return $data;
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

    public function load_parent()
    {
        if (   !isset($_POST['parentguid'])
            || empty($_POST['parentguid']))
        {
            throw new midgardmvc_exception("Object identifier not defined");
        }
        $identifier = $_POST['parentguid'];
        $guid = $this->clean_namespace($identifier);
        try
        {
            $this->parent = midgard_object_class::get_object_by_guid($guid);
        }
        catch (midgard_error_exception $e)
        {
            throw new midgardmvc_exception_notfound("Object {$guid}: " . $e->getMessage());
        }
    }

    public function handle_result($attachment)
    {
        $this->data = $this->attachment_to_data($attachment);

        if (   isset($_POST['variant'])
            && !empty($_POST['variant']))
        {
            $this->data['displayURL'] = "/mgd:attachment/{$attachment->guid}/{$_POST['variant']}/{$attachment->name}";
        }
    }

    public function put_associatelocation(array $args)
    {
        try
        {
            $this->parent = midgard_object_class::get_object_by_guid($args['identifier']);
        }
        catch (midgard_error_exception $e)
        {
            throw new midgardmvc_exception_notfound("Object {$args['identifier']}: " . $e->getMessage());
        }

        $data = $this->read_input();
        try
        {
            $this->associate_attachment = new midgardmvc_helper_attachmentserver_attachment($data->attachmentGuid);
        }
        catch (midgard_error_exception $e)
        {
            throw new midgardmvc_exception_notfound("File attachment {$data->attachmentGuid}: " . $e->getMessage());
        }

        if (   $this->associate_attachment->parentguid == $this->parent->guid
            && $this->associate_attachment->locationname == $data->locationName)
        {
            // This attachment is already associated, return
            $this->attachment_to_json($this->associate_attachment);
            return;
        }

        $transaction = new midgard_transaction();
        $transaction->begin();

        $qb = new midgard_query_builder('midgardmvc_helper_attachmentserver_attachment');
        $qb->add_constraint('parentguid', '=', $this->parent->guid);
        $qb->add_constraint('locationname', '=', $data->locationName);
        $attachments = $qb->execute();
        if (count($attachments) > 0)
        {
            // Move old attachment from out of the way
            foreach ($attachments as $attachment)
            {
                $attachment = $attachments[0];
                $attachment->locationname = '';
                $attachment->update();
            }
        }

        if ($this->associate_attachment->locationname == '')
        {
            // This is an unplaced attachment, we can use it as-is
            $this->associate_attachment->locationname = $data->locationName;
            $this->associate_attachment->update();
            $transaction->commit();
            $this->attachment_to_json($this->associate_attachment);
            return;
        }

        // This attachment is already associated with another location, copy
        $new_attachment = new midgardmvc_helper_attachmentserver_attachment();
        $new_attachment->name = "{$data->locationName}_{$this->associate_attachment->name}";
        $new_attachment->title = $this->associate_attachment->title;
        $new_attachment->mimetype = $this->associate_attachment->mimetype;
        $new_attachment->location = $this->associate_attachment->location;
        $new_attachment->locationname = $data->locationName;
        $new_attachment->create();
        $transaction->commit();
        $this->attachment_to_json($new_attachment);
    }

    private function attachment_to_json($attachment)
    {
        $this->data = array
        (
            'id' => $this->parent->guid,
            'locationName' => $attachment->locationname,
            'attachmentGuid' => $attachment->guid,
        );
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
            $handle = midgardmvc_core::get_instance()->dispatcher->get_stdin();
            $input = stream_get_contents($handle, (int) $_SERVER['CONTENT_LENGTH']);
            $data = json_decode($input);
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
}
