import { Entity, Fields, Validators } from "remult";

// The @Entity decorator tells Remult this class is an entity class
@Entity("tasks", {
  allowApiCrud: true //allow all CRUD operations for tasks
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
    }
  })
  title = ''; // entity data field of type String

  @Fields.boolean()
  completed = false;
};
