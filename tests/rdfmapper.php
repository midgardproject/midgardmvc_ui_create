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
    public function test_map_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::map_class('http://xmlns.com/foaf/0.1/Person');
        $this->assertEquals('midgard_person', $person_class);

        $person_class = midgardmvc_ui_create_rdfmapper::map_class('foaf:Person');
        $this->assertEquals('midgard_person', $person_class);

        //$person_class = midgardmvc_ui_create_rdfmapper::map_class('mgd:midgard_snippet');
        //$this->assertEquals('midgard_snippet', $person_class);
    }

    /**
     * @depends test_map_found
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_map_found_invalid()
    {
        // Person has a proper RDF mapping so this should not work
        $person_class = midgardmvc_ui_create_rdfmapper::map_class('mgd:person');
        $this->assertEquals('midgard_person', $person_class);
    }

    /**
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_map_not_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::map_class('http://example.net/foo');
    }

    /**
     * @depends test_map_found
     */
    public function test_property_found()
    {
        $person_class = midgardmvc_ui_create_rdfmapper::map_class('http://xmlns.com/foaf/0.1/Person');

        $property = midgardmvc_ui_create_rdfmapper::map_property($person_class, 'foaf:firstName');
        $this->assertEquals('firstname', $property);

        $property = midgardmvc_ui_create_rdfmapper::map_property($person_class, 'foaf:lastName');
        $this->assertEquals('lastname', $property);

        $property = midgardmvc_ui_create_rdfmapper::map_property($person_class, 'http://xmlns.com/foaf/0.1/lastName');
        $this->assertEquals('lastname', $property);

        $property = midgardmvc_ui_create_rdfmapper::map_property($person_class, 'mgd:id');
        $this->assertEquals('id', $property);
    }

    /**
     * @depends test_property_found
     * @expectedException midgardmvc_exception_notfound
     */
    public function test_property_found_invalid()
    {
        // Person firstname has a proper RDF mapping so this should not work
        $person_class = midgardmvc_ui_create_rdfmapper::map_class('http://xmlns.com/foaf/0.1/Person');

        $property = midgardmvc_ui_create_rdfmapper::map_property($person_class, 'mgd:firstname');
    }
}
?>
