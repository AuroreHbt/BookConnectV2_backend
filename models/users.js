const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  canCreateBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canCreateEvent: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canLikeBook: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
  canLikeEvent: Boolean, //par défaut = true, lié au token => droit donné ou non au user enregistré
});

const User = mongoose.model('users', userSchema);

module.exports = User;
