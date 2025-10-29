import { Model } from 'objection';
import '../../../database/knex.js';
import LocationModel from './LocationModel.js';

class TripModel extends Model {
  static get tableName() {
    return 'trips';
  }

  static get relationMappings() {
    return {
      locations: {
        relation: Model.HasManyRelation,
        modelClass: LocationModel,
        join: {
          from: 'trips.id',
          to: 'locations.trip_id'
        }
      }
    };
  }

  static get modifiers() {
    return {
      orderByVisited(builder) {
        builder.orderBy('visited_at', 'asc');
      }
    };
  }
}

export default TripModel;
