export default class LoginUserUseCase {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = 'AUTH_INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    const isValid = await this.passwordHasher.compare(
      password,
      user.passwordHash
    );

    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.code = 'AUTH_INVALID_CREDENTIALS';
      error.status = 401;
      throw error;
    }

    return user;
  }
}
