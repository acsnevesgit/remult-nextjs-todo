import { ErrorInfo } from "remult";
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';

import { remult } from '../src/common';
import { Task } from '../src/shared/Task';

const taskRepo = remult.repo(Task);

async function fetchTasks(hideCompleted: boolean) {
  return taskRepo.find({
    limit: 20,
    orderBy: { completed: "asc" }, // NOTE: By default, false is a "lower" value than true, and that's why uncompleted tasks are now showing at the top of the task list
    where: {
      completed: hideCompleted ? false : undefined, // setting the completed filter to undefined causes it to be ignored by Remult
    }
  });
};

const Home: NextPage = () => {
  const [tasks, setTasks] = useState<(Task & { error?: ErrorInfo<Task> })[]>([]); // store errors and display them next to the relevant input element
  const [hideCompleted, setHideCompleted] = useState(false);

  // Add New Tasks
  const addTask = () => {
    setTasks([...tasks, new Task()]);
  };

  useEffect(() => {
    fetchTasks(hideCompleted).then(setTasks); //  hook used to call fetchTasks once when the React component is loaded
  }, [hideCompleted]); //  effect re-runs when hideCompleted changes

  return (
    <div>
      <input
        type="checkbox"
        checked={hideCompleted}
        onChange={event => setHideCompleted(event.target.checked)} /> Hide Completed
      <hr />
      {tasks.map(task => {
        const handleChange = (values: Partial<Task>) => {
          setTasks(tasks.map(t => t === task ? { ...task, ...values } : t)); // replaces the tasks state with a new array containing all unchanged tasks and a new version of the current task that includes the modified values
        };

        // Function to save the state of a task to the backend database, and a Save button to call it.
        const saveTask = async () => {
          try {
            const savedTask = await taskRepo.save(task);
            setTasks(tasks.map(t => t === task ? savedTask : t));
          } catch (error: any) { // to catch exceptions
            alert(error.message); // displays "Should not be empty" error message
            setTasks(tasks.map(t => t === task ? { ...task, error } : t)); // store the errors
          }
        };

        // Delete Tasks
        const deleteTask = async () => {
          await taskRepo.delete(task);
          setTasks(tasks.filter(t => t !== task));
        };

        return (
          <div key={task.id}>
            <input type="checkbox"
              checked={task.completed}
              onChange={event => handleChange({ completed: event.target.checked })} />
            <input
              value={task.title}
              onChange={event => handleChange({ title: event.target.value })} />
            {task.error?.modelState?.title} {/* The modelState property of the ErrorInfo object contains error messages for any currently invalid fields in the entity object */}
            <button onClick={saveTask}>Save</button>
            <button onClick={deleteTask}>Delete</button>
          </div>
        );
      })}
      <button onClick={addTask}>Add Task</button>
    </div>
  )
}

export default Home;