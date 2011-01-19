<?php
class midgardmvc_ui_create_rdfmapper
{
    public $typeof = '';
    public $about = '';
    public $mgdschema = '';

    public function __construct($mgdschema, $identifier = null)
    {
        if (is_object($mgdschema))
        {
            $this->about = "urn:uuid:{$mgdschema->guid}";
            $mgdschema = get_class($mgdschema);
        }

        if ($identifier)
        {
            $this->about = $identifier;
        }

        $this->mgdschema = $mgdschema;
        $this->typeof = self::class_to_typeof($mgdschema);
    }

    public function __get($key)
    {
        return $this->map_property($key);
    }

    private function map_property($property)
    {
        static $property_map = array();
        if (!isset($property_map[$this->mgdschema]))
        {
            $property_map[$this->mgdschema] = array();
        }

        if (isset($property_map[$this->mgdschema][$property]))
        {
            return $property_map[$this->mgdschema][$property];
        }

        $namespaces = self::get_namespace_map($this->mgdschema);
        $namespaced_property = self::expand_prefix($property, $namespaces);
        
        $dummy = new $this->mgdschema();
        $props = get_object_vars($dummy);
        $reflector = new midgard_reflection_property($this->mgdschema);
        foreach ($props as $prop => $value)
        {
            $rdfprop = $reflector->get_user_value($prop, 'property');
            if (!$rdfprop)
            {
                $rdfprop = "mgd:{$prop}";
            }

            if ($property == $prop)
            {
                // Straight, un-namespaced match
                $property_map[$this->mgdschema][$property] = $rdfprop;
                return $property_map[$this->mgdschema][$property];
            }

            $nsprop = self::expand_prefix($rdfprop, $namespaces);
            if ($namespaced_property == $nsprop)
            {
                
                $property_map[$this->mgdschema][$property] = $prop;
                return $property_map[$this->mgdschema][$property];
            }
        }

        throw new midgardmvc_exception_notfound("Unable to map {$property} to a property of {$this->mgdschema}");
    }

    public static function class_to_typeof($mgdschema)
    {
        static $typeofs = array();
        if (isset($typeofs[$mgdschema]))
        {
            return $typeofs[$mgdschema];
        }

        $mgdschemas = self::get_mgdschemas();
        if (!in_array($mgdschema, $mgdschemas))
        {
            throw new midgardmvc_exception_notfound("Unrecognized MgdSchema type {$mgdschema}");
        }

        $namespaces = self::get_namespace_map($mgdschema);
        $reflector = new midgard_reflection_class($mgdschema);
        $typeofs[$mgdschema] = $reflector->get_user_value('typeof');
        if (!$typeofs[$mgdschema])
        {
            $typeofs[$mgdschema] = "{$namespaces['mgd']}{$mgdschema}";
        }
        return $typeofs[$mgdschema];
    }

    public static function typeof_to_class($type)
    {
        static $mapped_classes = array();
        if (isset($mapped_classes[$type]))
        {
            return $mapped_classes[$type];
        }

        // Load class mappings
        $mgdschemas = self::get_mgdschemas();
        // Check for RDF type match
        foreach ($mgdschemas as $mgdschema)
        {
            $namespaces = self::get_namespace_map($mgdschema);
            $reflector = new midgard_reflection_class($mgdschema);
            $typeof = $reflector->get_user_value('typeof');
            if (!$typeof)
            {
                $typeof = "{$namespaces['mgd']}{$mgdschema}";
            }

            if ($typeof == $type)
            {
                // Straight, fully-qualified match
                $mapped_classes[$type] = $mgdschema;
                return $mapped_classes[$type];
            }

            foreach ($namespaces as $prefix => $url)
            {
                $nstype = $type;
                if (substr($type, 0, strlen($prefix)) == $prefix)
                {
                    $nstype = str_replace("{$prefix}:", $url, $type);
                }

                if ($typeof == $nstype)
                {
                    $mapped_classes[$type] = $mgdschema;
                    return $mapped_classes[$type];
                }
            }
        }

        throw new midgardmvc_exception_notfound("Unrecognized MgdSchema type {$type}");
    }

    private static function get_mgdschemas()
    {
        return midgardmvc_core::get_instance()->dispatcher->get_mgdschema_classes();
    }

    private static function expand_prefix($value, array $namespaces)
    {
        foreach ($namespaces as $prefix => $url)
        {
            if (substr($value, 0, strlen($prefix)) == $prefix)
            {
                // Expand to prefix to URL
                return str_replace("{$prefix}:", $url, $value);
            }

            if (substr($value, 0, strlen($url)) == $url)
            {
                // Full URL match
                return $value;
            }
        }
        return "{$namespaces['mgd']}{$value}";
    }

    private static function get_namespace_map($type)
    {
        static $nsmap = array();
        if (isset($nsmap[$type]))
        {
            return $nsmap[$type];
        }

        $mgdschemas = self::get_mgdschemas();
        if (!in_array($type, $mgdschemas))
        {
            throw new midgardmvc_exception_notfound("Type {$type} is not a registered MgdSchema");
        }

        $nsmap[$type] = array
        (
            'mgd' => 'http://www.midgard-project.org/midgard2/9.03/',
        );

        $reflector = new midgard_reflection_class($type);
        $namespaces = $reflector->get_user_value('namespaces');
        if (empty($namespaces))
        {
            // Type didn't register additional namespaces
            return $nsmap[$type];
        }

        $namespaces = explode(',', $namespaces);
        foreach ($namespaces as $namespace)
        {
            $namespace_parts = explode(':', $namespace, 2);
            $nsmap[$type][$namespace_parts[0]] = $namespace_parts[1];
        }

        return $nsmap[$type];
    }

    public static function load_object($type, $identifier = null)
    {
        $mgdschema = self::typeof_to_class($type);

        if (is_null($identifier))
        {
            return new $mgdschema;
        }

        if (substr($identifier, 0, 4) == 'mgd:')
        {
            $identifier = substr($identifier, 4);
        }
        elseif (substr($identifier, 0, 9) == 'urn:uuid:')
        {
            $identifier = substr($identifier, 9);
        }

        try
        {
            return new $mgdschema($identifier);
        }
        catch (midgard_error_exception $e)
        {
            throw new midgardmvc_exception_notfound("Object {$guid}: " . $e->getMessage());
        }
    }
}
