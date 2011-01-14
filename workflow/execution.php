<?php
/**
 * @package midgardmvc_ui_create
 * @author The Midgard Project, http://www.midgard-project.org
 * @copyright The Midgard Project, http://www.midgard-project.org
 * @license http://www.gnu.org/licenses/lgpl.html GNU Lesser General Public License
 */

/**
 * Midgard-based workflow execution provider
 * Loosely adapted from ezcWorkflowDatabaseExecution
 *
 * @package midgardmvc_ui_create
 */
class midgardmvc_ui_create_workflow_execution extends ezcWorkflowExecution
{
    /**
     * @var midgardmvc_ui_create_wf_execution
     */
    private $execution = null;

    /**
     * @var midgard_transaction
     */
    private $transaction = null;

    /**
     * Container to hold the properties
     *
     * @var array(string=>mixed)
     */
    protected $properties = array(
        'definitionStorage' => null,
        'workflow' => null,
        'options' => null
    );

    /**
     * Construct a new Midgard execution.
     *
     * This constructor is a tie-in.
     *
     * @param  ezcWorkflow   $workflow
     * @param  int           $executionId
     * @throws ezcWorkflowExecutionException
     */
    public function __construct(ezcWorkflow $workflow, $executionId = null)
    {
        if (   $executionId !== null 
            && !is_int($executionId))
        {
            throw new ezcWorkflowExecutionException('$executionId must be an integer.');
        }

        $this->properties['workflow'] = $workflow;

        if (is_int($executionId))
        {
            $this->loadExecution( $executionId);
        }

        $this->transaction = new midgard_transaction();
    }

    /**
     * Property get access.
     *
     * @param string $propertyName
     * @return mixed
     * @throws ezcBasePropertyNotFoundException
     *         If the given property could not be found.
     * @ignore
     */
    public function __get($propertyName)
    {
        switch ( $propertyName )
        {
            case 'definitionStorage':
            case 'workflow':
            case 'options':
                return $this->properties[$propertyName];
        }

        throw new ezcBasePropertyNotFoundException($propertyName);
    }

    /**
     * Property set access.
     *
     * @param string $propertyName
     * @param string $propertyValue
     * @throws ezcBasePropertyNotFoundException
     *         If the given property could not be found.
     * @throws ezcBaseValueException
     *         If the value for the property options is not an ezcWorkflowDatabaseOptions object.
     * @ignore
     */
    public function __set($propertyName, $propertyValue)
    {
        switch ($propertyName)
        {
            case 'definitionStorage':
            case 'workflow':
            case 'options':
                return parent::__set($propertyName, $propertyValue);
            default:
                throw new ezcBasePropertyNotFoundException( $propertyName );
        }
        $this->properties[$propertyName] = $propertyValue;
    }

    /**
     * Property isset access.
     *
     * @param string $propertyName
     * @return bool
     * @ignore
     */
    public function __isset( $propertyName )
    {
        switch ($propertyName)
        {
            case 'definitionStorage':
            case 'workflow':
            case 'options':
                return true;
        }

        return false;
    }

    /**
     * Start workflow execution.
     *
     * @param  int $parentId
     * @throws ezcDbException
     */
    protected function doStart($parentId)
    {
        $this->transaction->begin();

        $this->execution = new midgardmvc_ui_create_wf_execution();
        $this->execution->workflow = (int) $this->workflow->id;
        $this->execution->parent = (int) $parentId;
        $this->execution->started = new midgard_datetime();
        $this->execution->nextthread = (int) $this->nextThreadId;
        $this->execution->variables = self::serialize($this->variables);
        $this->execution->waitingfor = self::serialize($this->waitingFor);
        $this->execution->threads = self::serialize($this->threads);
        $this->execution->create();
    }

    /**
     * Suspend workflow execution.
     *
     * @throws ezcDbException
     */
    protected function doSuspend()
    {
        $this->execution->suspended = new midgard_datetime();
        $this->execution->nextthread = (int) $this->nextThreadId;
        $this->execution->variables = self::serialize($this->variables);
        $this->execution->waitingfor = self::serialize($this->waitingfor);
        $this->execution->threads = self::serialize($this->threads);
        $this->execution->update();

        $this->delete_states($this->execution);

        foreach ($this->activatedNodes as $node)
        {
            $state = new midgardmvc_ui_create_wf_execution_state();
            $state->execution = $this->execution->id;
            $state->node = (int) $node->getId();
            $state->thread = (int) $node->getThreadId();
            $state->state = self::serialize($node->getState());
            $state->activatedfrom = self::serialize($node->getActivatedFrom());
            $state->create();
        }

        $this->transaction->commit();
    }

    /**
     * Resume workflow execution.
     *
     * @throws ezcDbException
     */
    protected function doResume()
    {
        $this->transaction->begin();
    }

    /**
     * End workflow execution.
     *
     * @throws ezcDbException
     */
    protected function doEnd()
    {
        $this->delete_execution($this->execution);

        if (!$this->isCancelled())
        {
            $this->transaction->commit();
        }
    }

    private function delete_execution(midgardmvc_ui_create_wf_execution $execution)
    {
        $exec_qb = new midgard_query_builder('midgardmvc_ui_create_wf_execution');
        $exec_qb->add_constraint('parent', '=', $execution->id);
        $children = $exec_qb->execute();
        foreach ($children as $child)
        {
            $this->delete_execution($child);
        }

        $this->delete_states($execution);

        $execution->delete();
    }

    private function delete_states(midgardmvc_ui_create_wf_execution $execution)
    {
        $qb = new midgard_query_builder('midgardmvc_ui_create_wf_execution_state');
        $qb->add_constraint('execution', '=', $execution->id);
        $states = $qb->execute();
        foreach ($states as $state)
        {
            $state->delete();
        }
    }

    /**
     * Returns a new execution object for a sub workflow.
     *
     * @param  int $id
     * @return ezcWorkflowExecution
     */
    protected function doGetSubExecution($id = null)
    {
        return new ezcWorkflowDatabaseExecution($id);
    }

    /**
     * Load execution state.
     *
     * @param int $executionId  ID of the execution to load.
     * @throws ezcWorkflowExecutionException
     */
    protected function loadExecution($executionId)
    {
        $this->execution = new midgardmvc_ui_create_wf_execution();
        try
        {
            $this->execution->get_by_id($executionId);
        }
        catch (midgard_error_exception $e)
        {
            throw new ezcWorkflowExecutionException(
              'Could not load execution state.'
            );
        }

        $this->nextThreadId = $this->execution->nextthread;

        $this->threads = self::unserialize($this->execution->threads);
        $this->variables = self::unserialize($this->execution->variables);
        $this->waitingFor = self::unserialize($this->execution->waitingfor);

        $qb = new midgard_query_builder('midgardmvc_ui_create_wf_execution_state');
        $qb->add_constraint('execution', '=', $this->execution->id);
        $states = $qb->execute();
        $active = array();
        foreach ($states as $state)
        {
            $active[$state->node] = array
            (
                'activated_from' => self::unserialize($state->activatedfrom),
                'state' => self::unserialize($state->state),
                'thread_id' => $state->thread,
            );
        }

        foreach ($this->workflow->nodes as $node)
        {
            $nodeId = $node->getId();

            if (!isset($active[$nodeId]))
            {
                continue;
            }

            $node->setActivationState(ezcWorkflowNode::WAITING_FOR_EXECUTION);
            $node->setThreadId($active[$nodeId]['thread_id']);
            $node->setState($active[$nodeId]['state'], null);
            $node->setActivatedFrom($active[$nodeId]['activated_from'] );

            $this->activate($node, false);
        }

        $this->cancelled = false;
        $this->ended     = false;
        $this->loaded    = true;
        $this->resumed   = false;
        $this->suspended = true;
    }

    /**
     * Wrapper for serialize() that returns an empty string
     * for empty arrays and null values.
     *
     * @param  mixed $var
     * @return string
     */
    public static function serialize($var)
    {
        $var = serialize($var);

        if (   $var == 'a:0:{}'
            || $var == 'N;')
        {
            return '';
        }

        return $var;
    }

    /**
     * Wrapper for unserialize().
     *
     * @param  string $serializedVar
     * @param  mixed  $defaultValue
     * @return mixed
     */
    public static function unserialize($serializedVar, $defaultValue = array())
    {
        if (!empty($serializedVar))
        {
            return unserialize($serializedVar);
        }
        else
        {
            return $defaultValue;
        }
    }
}
