export default class ListUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ filter = {}, pagination = {} } = {}) {
    return this.userRepository.listUsers({ filter, pagination });
  }
}
