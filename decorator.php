<?php
class midgardmvc_ui_create_decorator
{
    public $rdfmapper = null;
    private $__object = null;
    private $__local = array();

    public function __construct(midgard_object $object, $identifier = null)
    {
        $this->__object = $object;
        $this->rdfmapper = new midgardmvc_ui_create_rdfmapper($object, $identifier);
    }

    public function __get($key)
    {
        if (isset($this->__local[$key])) {
            return $this->__local[$key];
        }
        return $this->__object->$key;
    }

    public function __set($key, $value)
    {
        if (isset($this->__object->$key)) {
            $this->__object->$key = $value;
            return;
        }
        $this->__local[$key] = $value;
    }

    public function __isset($key)
    {
        if (isset($this->__local[$key])) {
            return true;
        }
        return isset($this->__object->$key);
    }

    public function get_object()
    {
        return $this->__object;
    }
}
