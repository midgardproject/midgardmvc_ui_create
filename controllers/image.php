<?php
class midgardmvc_ui_create_controllers_image extends midgardmvc_helper_attachmentserver_controllers_upload
{
    public function __construct(midgardmvc_core_request $request)
    {
        $this->request = $request;
    }

    public function get_search(array $args)
    {
        $qb = new midgard_query_builder('midgardmvc_helper_attachmentserver_attachment');
        $query = $this->request->get_query();
        if (   isset($query['q'])
            && !empty($query['q']))
        {
            $qb->begin_group('OR');
            $qb->add_constraint('name', 'LIKE', "{$query['q']}%");
            $qb->add_constraint('title', 'LIKE', "{$query['q']}%");
            $qb->end_group();
        }
        else
        {
            $qb->set_limit(10);
        }
        $qb->add_constraint('mimetype', 'LIKE', 'image/%');
        $qb->add_order('metadata.revised', 'DESC');
        $attachments = $qb->execute();

        $this->data['images'] = array();
        foreach ($attachments as $attachment)
        {
            $parent = midgard_object_class::get_object_by_guid($attachment->parentguid);
            if (  $parent instanceof midgard_attachment
                || $parent instanceof midgardmvc_helper_attachmentserver_attachment)
            {
                continue;
            }
            
            $this->data['images'][] = $this->attachment_to_data($attachment);
        }

        $this->data['variants'] = array();
        $variants = midgardmvc_core::get_instance()->configuration->attachmentserver_variants;
        foreach ($variants as $variant => $config)
        {
            $this->data['variants'][$variant] = $variant;
        }
    }

    private function attachment_to_data($attachment)
    {
        $data = array
        (
            'guid' => $attachment->guid,
            'parentguid' => $attachment->parentguid,
            'name' => $attachment->name,
            'title' => $attachment->title,
            'size' => $attachment->metadata->size,
            'url' => "/mgd:attachment/{$attachment->guid}/{$attachment->name}",
        );
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
        $this->data['status'] = 'ok';
        $this->data['image'] = $this->attachment_to_data($attachment);

        if (   isset($_POST['variant'])
            && !empty($_POST['variant']))
        {
            $this->data['image']['url'] = "/mgd:attachment/{$attachment->guid}/{$_POST['variant']}/{$attachment->name}";
            return;
        }
        $this->data['image']['url'] = "/mgd:attachment/{$attachment->guid}/{$attachment->name}";
    }
}
