import { Model } from 'objection';
import '../../../database/knex.js';
class UserModel extends Model {
  static get tableName() {
    return 'users';
  }
}

export default UserModel;
