export default class UserRepository {
  async createUser(_userInput) {
    throw new Error('createUser must be implemented by subclasses');
  }

  async findByEmail(_email) {
    throw new Error('findByEmail must be implemented by subclasses');
  }

  async findById(_id) {
    throw new Error('findById must be implemented by subclasses');
  }
}
