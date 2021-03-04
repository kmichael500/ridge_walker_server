import { DocumentType } from "@typegoose/typegoose";
import { User, UserModel } from "../../Models/Database/User";

/** Methods to interact with User documents. */
export namespace UserRepository {
  // #region Create

  /**
   * Create a user.
   *
   * @param {User} user - User to create
   * @returns {Promise<void>} - It will throw an error if there is a problem.
   */
  export async function insert(user: User): Promise<void> {
    await UserModel.create(user);
  }

  /**
   * Upsert a user. It only upserts the values that are passed in. If creating a
   * user, all required user values need to be passed in.
   *
   * @param {User} user - User to create
   * @returns {Promise<void>} - It will throw an error if there is a problem.
   */
  export async function upsertByEmail(user: User): Promise<void> {
    // This upsert function is funky because mongoose doesn't call the save pre hook when using findOneAndUpdate, update, etc which is needed for validation and updating a password
    const entries = Object.keys(user);
    const updates = {} as any;

    // constructing dynamic query
    for (let i = 0; i < entries.length; i++) {
      updates[entries[i]] = Object.values(user)[i];
    }
    const doc = await UserModel.findOne({ email: user.email });
    if (doc) {
      // TODO: Figure out typing stuff
      const documentAsAny = doc as any;
      for (let i = 0; i < entries.length; i++) {
        // updating document
        documentAsAny[entries[i]] = updates[entries[i]];
      }
      await doc.save();
    } else {
      insert(user);
    }
  }

  // #endregion

  // #region Get

  /**
   * Gets a cave by id from the Db.
   *
   * @template T - Will return UserDocument or just the User.
   * @param {string} email - The email of the user.
   * @returns {Promise<User | DocumentType<User> | null>} Returns null if the
   *   user does not exist.
   */
  export async function getByEmail<T extends DocumentType<User> | User>(
    email: string
  ): Promise<T | null> {
    return (await UserModel.findOne({ email: email })) as T;
  }

  // #endregion
}
