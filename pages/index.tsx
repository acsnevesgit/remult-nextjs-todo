import { ErrorInfo } from "remult";
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';

import { remult } from '../src/common';
import { Task } from '../src/shared/Task';
import { AuthController } from "../src/shared/AuthController";
import { TasksController } from "../src/shared/TasksController";
import { loadAuth, setAuthToken } from "../src/common";

const taskRepo = remult.repo(Task);

async function fetchTasks(hideCompleted: boolean) {
  if (!taskRepo.metadata.apiReadAllowed)
    return [];
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
  const [username, setUsername] = useState("");

  useEffect(() => {
    loadAuth();
    fetchTasks(hideCompleted).then(setTasks); //  hook used to call fetchTasks once when the React component is loaded
  }, [hideCompleted]); //  effect re-runs when hideCompleted changes

  // Add New Tasks
  const addTask = () => {
    setTasks([...tasks, new Task()]);
  };

  // Mark all tasks as complete/uncomplete
  const setAll = async (completed: boolean) => {
    // call to the setAll method in the TasksController
    await TasksController.setAll(completed);
    setTasks(await fetchTasks(hideCompleted));
  };

  const signIn = async () => {
    try {
      setAuthToken(await AuthController.signIn(username));
      window.location.reload();
    }
    catch (error: any) {
      alert(error.message);
    }
  }

  const signOut = () => {
    setAuthToken(null);
    window.location.reload();
  }

  if (!remult.authenticated())
    return (<div>
      <p>
        <input value={username} onChange={e => setUsername(e.target.value)} />
        <button onClick={signIn}>Sign in</button>
      </p>
    </div>);

  return (
    <div>
      <p>
        Hi {remult.user.name} <button onClick={signOut}>Sign out</button>
      </p>
      <div>
        <button onClick={() => setAll(true)}>Set all as completed</button>
        <button onClick={() => setAll(false)}>Set all as uncompleted</button>
      </div>
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