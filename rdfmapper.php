<?php
class midgardmvc_ui_create_rdfmapper
{
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

    public static function get_namespace_map($type)
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

    public static function map_class($type)
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

    public static function map_property($mgdschema, $property)
    {
        static $property_map = array();
        if (!isset($property_map[$mgdschema]))
        {
            $property_map[$mgdschema] = array();
        }

        if (isset($property_map[$mgdschema][$property]))
        {
            return $property_map[$mgdschema][$property];
        }

        $namespaces = self::get_namespace_map($mgdschema);
        $namespaced_property = self::expand_prefix($property, $namespaces);
        
        $dummy = new $mgdschema();
        $props = get_object_vars($dummy);
        $reflector = new midgard_reflection_property($mgdschema);

        foreach ($props as $prop => $value)
        {
            $rdfprop = $reflector->get_user_value($prop, 'property');
            if (!$rdfprop)
            {
                $rdfprop = $prop;
            }
            $nsprop = self::expand_prefix($rdfprop, $namespaces);
            if ($namespaced_property == $nsprop)
            {
                $property_map[$mgdschema][$property] = $prop;
                return $property_map[$mgdschema][$property];
            }
        }

        throw new midgardmvc_exception_notfound("Unable to map {$property} to a property of {$mgdschema}");
    }
}
