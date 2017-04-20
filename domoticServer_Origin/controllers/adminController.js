var express = require('express');
var router = express.Router();

var passport = require('passport');

var Admin = require('../models/adminModel');

router.get('/', function(req, res){
	res.render('index', {userError: req.flash('userError'), passwordError : req.flash('passwordError')});
});

router.get('/dashboard', isLoggin, function(req, res){
	res.render('dashboard', {user: req.user});
});

router.get('/nuevo', isLoggin, function(req, res){
	res.render('nuevousuario');
});

router.post('/', passport.authenticate('local.signup', {
	successRedirect: 'dashboard',
	failureRedirect: '/',
	failureFlash: true
}));
router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

module.exports = router;

function isLoggin(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}