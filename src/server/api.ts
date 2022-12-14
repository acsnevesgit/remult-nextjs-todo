import { createRemultServer } from "remult/server";
import { createPostgresConnection } from "remult/postgres";

import { AuthController } from "../shared/AuthController";
import { TasksController } from "../shared/TasksController";
import { Task } from "../shared/Task";

// RemultServer API middleware to a catch all dynamic API route
export const api = createRemultServer({
  dataProvider: async () => {
    if (process.env["NODE_ENV"] === "production")
      return createPostgresConnection({ configuration: "heroku" }); //  tells Remult to use the DATABASE_URL environment variable as the connectionString for Postgres
    return undefined; // in development, the dataProvider function returns undefined, causing Remult to continue to use the default JSON-file database
  },
  controllers: [AuthController, TasksController],
  entities: [Task],
  initApi: async remult => { // this callback is called only once, after a database connection is established and the server is ready to perform initialization operations
    const taskRepo = remult.repo(Task); // Remult Repository object used to fetch and create Task entity objects
    if (await taskRepo.count() === 0) {
      // adds five new Tasks to the database if the current count is zero
      await taskRepo.insert([
        { title: "Task a" },
        { title: "Task b", completed: true },
        { title: "Task c" },
        { title: "Task d" },
        { title: "Task e", completed: true }
      ]);
    }
  }
});