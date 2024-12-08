export class User {
  constructor({
    usernameSelector,
    userDescriptionSelector,
    userAvatarSelector,
  }) {
    this._username = document.querySelector(usernameSelector);
    this._userDescription = document.querySelector(userDescriptionSelector);
    this._avatarLink = document.querySelector(userAvatarSelector);
  }
  get() {
    return {
      username: this._username.textContent,
      description: this._userDescription.textContent,
    };
  }
  update({ username, description }) {
    this._username.textContent = username;
    this._userDescription.textContent = description;
  }
  setAvatar(avatarLink) {
    this._avatarLink.src = avatarLink;
  }
}
