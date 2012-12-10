<?php
/**
 * @package midgardmvc_core
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Unit tests for the RDF mapper class
 *
 * @package midgardmvc_core
 */
class midgardmvc_ui_create_tests_rdfmapper extends midgardmvc_core_tests_testcase
{
    public function test_typeof_to_class_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('http://xmlns.com/foaf/0.1/Person');
        $this->assertEquals('midgard_person', $person_class);

        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('foaf:Person');
        $this->assertEquals('midgard_person', $person_class);

        //$person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('mgd:midgard_snippet');
        //$this->assertEquals('midgard_snippet', $person_class);
    }

    /**
     * @depends test_typeof_to_class_found
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_typeof_to_class_found_invalid()
    {
        // Person has a proper RDF mapping so this should not work
        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('mgd:person');
        $this->assertEquals('midgard_person', $person_class);
    }

    /**
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_typeof_to_class_not_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('http://example.net/foo');
    }

    public function test_class_to_typeof_found()
    {
        $person_typeof = midgardmvc_ui_create_rdfmapper::class_to_typeof('midgard_person');
        $this->assertEquals('http://xmlns.com/foaf/0.1/Person', $person_typeof);
    }

    /**
     * @depends test_class_to_typeof_found
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_class_to_typeof_invalid()
    {
        $person_typeof = midgardmvc_ui_create_rdfmapper::class_to_typeof('foobar');
    }

    /**
     * @depends test_typeof_to_class_found
     */
    public function test_property_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('http://xmlns.com/foaf/0.1/Person');
        $mapper = new midgardmvc_ui_create_rdfmapper($person_class);

        $property = 'foaf:firstName';
        $this->assertEquals('firstname', $mapper->$property);

        $property = 'foaf:lastName';
        $this->assertEquals('lastname', $mapper->$property);

        $property = 'http://xmlns.com/foaf/0.1/lastName';
        $this->assertEquals('lastname', $mapper->$property);

        $property = 'mgd:id';
        $this->assertEquals('id', $mapper->$property);

        // Test reverse mapping too
        $property = 'id';
        $this->assertEquals('mgd:id', $mapper->$property);

        $property = 'lastname';
        $this->assertEquals('foaf:lastName', $mapper->$property);
    }

    /**
     * @depends test_property_found
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_property_found_invalid()
    {
        // Person firstname has a proper RDF mapping so this should not work
        $person_class = midgardmvc_ui_create_rdfmapper::typeof_to_class('http://xmlns.com/foaf/0.1/Person');
        $mapper = new midgardmvc_ui_create_rdfmapper($person_class);

        $property = 'mgd:firstname';
        $mapper->$property;
    }
}
?>
