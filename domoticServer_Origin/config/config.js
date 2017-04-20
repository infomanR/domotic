var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Admin = require('../models/adminModel');
var Usuario = require('../models/usuarioModel');

passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	Admin.findById(id, function(err, user){
		if(err) return err;
		done(err, user);
	});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'user-name',
	passwordField: 'user-password',
	passReqToCallback: true
}, function(req, username, password, done){
	Admin.findOne({'usuario': username}, function(err, user){
		if(err) return done(err);
		if(!user){
			req.flash('userError', 'Usuario incorrecto');
			console.log("usuario incorrecto");
			return done(null, false);
		}
		if(!user.validPassword(password)){
			req.flash('passwordError', 'Password incorrecto');
			console.log("password incorrecto");
			return done(null, false);
		}
		console.log("usuario correcto");
		return done(null, user);
	});
}));