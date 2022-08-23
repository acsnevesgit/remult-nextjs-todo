import { Allow, Entity, Fields, Validators } from "remult";
import { Roles } from "./roles";

// The @Entity decorator tells Remult this class is an entity class
@Entity("tasks", {
  // allowApiCrud: true //allow all CRUD operations for tasks
  // allowApiCrud: Allow.authenticated //allow all CRUD operations for tasks
  allowApiRead: Allow.authenticated,
  allowApiUpdate: Allow.authenticated,
  allowApiInsert: Roles.admin,
  allowApiDelete: Roles.admin
})

export class Task {
  // decorator that tells Remult to automatically generate an id using uuid
  @Fields.uuid()
  id!: string; //optional

  @Fields.string({
    // validate: Validators.required,
    validate: (task) => {
      if (task.title.length < 6)
        throw "Too Short";
    },
    allowApiUpdate: Roles.admin
  })
  title = ''; // entity data field of type String

  @Fields.boolean()
  completed = false;
};
