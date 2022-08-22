const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');//Un validateur unique pour les mail des users

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},// ajout de unique pour pouvoir avoir 1 seul compte par email, et pas de collisions de données
    password: {type: String, required: true} // Mais on rajoute du coup le package mongoose unique validator pour améliorer la lisibilité
});

userSchema.plugin(uniqueValidator);//On appelle la méthode plugin avec UniqueValidator en arg à la methode => On n'aura pas plusieurs validateurs par mail !!

module.exports = mongoose.model('User', userSchema);
