var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var usuarioSchema = mongoose.Schema({
	nombres: {type: String},
	apPaterno: {type: String},
	apMaterno: {type: String},
	email: {type: String},
	password: {type: String}
});

usuarioSchema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = mongoose.model('Usuario', usuarioSchema);