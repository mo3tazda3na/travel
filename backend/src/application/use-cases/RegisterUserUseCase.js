export default class RegisterUserUseCase {
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);

    if (existing) {
      const error = new Error('A user with this email already exists');
      error.code = 'USER_ALREADY_EXISTS';
      error.status = 409;
      throw error;
    }

    const passwordHash = await this.passwordHasher.hash(password);
    return this.userRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });
  }
}
