import { Allow, BackendMethod, Remult } from "remult";
import { Task } from "./Task";
import { Roles } from "./roles";

export class TasksController {
  @BackendMethod({ allowed: Roles.admin })
  @BackendMethod({ allowed: Allow.authenticated }) // decorator tells Remult to expose the method as an API endpoint
  
  static async setAll(completed: boolean, remult?: Remult) {
    const taskRepo = remult!.repo(Task);

    // Method to be run on the server instead of the client
    //Unlike the front-end Remult object, the server implementation interacts directly with the database.
    for (const task of await taskRepo.find()) {
      await taskRepo.save({ ...task, completed });
    };
  };
};
