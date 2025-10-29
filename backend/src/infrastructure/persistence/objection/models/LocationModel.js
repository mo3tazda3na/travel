import { Model } from 'objection';
import '../../../database/knex.js';

class LocationModel extends Model {
  static get tableName() {
    return 'locations';
  }
}

export default LocationModel;
