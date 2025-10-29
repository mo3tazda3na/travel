export default class User {
  constructor({
    id = null,
    name,
    email,
    passwordHash = null,
    createdAt = null,
    role = 'member',
    subscriptionLevel = 'free',
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.role = role;
    this.subscriptionLevel = subscriptionLevel;
  }
}
