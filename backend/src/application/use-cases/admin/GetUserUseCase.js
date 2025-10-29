export default class GetUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    if (!userId) {
      const error = new Error('User id is required');
      error.code = 'ADMIN_USER_ID_REQUIRED';
      error.status = 400;
      throw error;
    }

    return this.userRepository.findById(userId);
  }
}
