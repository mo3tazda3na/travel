export default class UpdateUserRoleUseCase {
  constructor(userRepository, authorizationRepository) {
    this.userRepository = userRepository;
    this.authorizationRepository = authorizationRepository;
  }

  async execute(userId, { role, subscriptionLevel }) {
    if (!userId) {
      const error = new Error('User id is required');
      error.code = 'ADMIN_USER_ID_REQUIRED';
      error.status = 400;
      throw error;
    }

    const updates = {};
    if (role) {
      updates.role = role;
    }
    if (subscriptionLevel) {
      updates.subscriptionLevel = subscriptionLevel;
    }

    if (!Object.keys(updates).length) {
      return this.userRepository.findById(userId);
    }

    const updated = await this.userRepository.updateUser(userId, updates);
    this.authorizationRepository.invalidateCache();
    return updated;
  }
}
