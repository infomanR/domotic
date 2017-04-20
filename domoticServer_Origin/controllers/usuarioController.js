var express = require('express');
var router = express.Router();
var Usuario = require('../models/usuarioModel');
var expressValidator = require('express-validator');

router.get('/newuser', isLoggin, function(req, res){
	res.render('nuevousuario', {
		user: req.user,
		message: '',
		errors: '',
		unique: ''
	});
});

router.post('/newuser', function(req, res){
	req.assert('nombres', 'El campo nombres es necesario').notEmpty();
	req.assert('paterno', 'El campo apellido paterno es necesario').notEmpty();
	req.assert('materno', 'El campo apellido materno es necesario').notEmpty(); 
	req.assert('email', 'El campo email no es correcto').notEmpty();
    req.assert('email', 'El campo email no es correcto').isEmail();
    req.assert('password', 'El campo password es necesario').notEmpty();
    req.assert('password', 'El password debe contener minimo 5 caracteres').isLength({min:5, max:undefined});
    req.assert('password', 'Los passwords no coninciden').equals(req.body.passwordConfirm);
    var errors = req.validationErrors();
    Usuario.findOne({'email': req.body.email}, function(err, user){
    	var unique = '';
    	if(err){
    		return err;
    	}
    	if(user){
    		console.log("El email ya existe");
    		unique = 'El email ya existe';
    	}
		if(!errors && (unique == '')){
			console.log("No hay errores en el formulario");
			var nuevoUsr = new Usuario();
			nuevoUsr.nombres = req.body.nombres;
			nuevoUsr.apPaterno = req.body.paterno;
			nuevoUsr.apMaterno = req.body.materno;
			nuevoUsr.email = req.body.email;
			nuevoUsr.password = nuevoUsr.encryptPassword(req.body.password);
			nuevoUsr.save(function(err){
				if(err){
					return err;
				}
				console.log("Nuevo usuario guardado correctamente");
			});
			res.render('nuevousuario', {
				user: req.user,
				message: "Usario creado correctamente",
				errors: '',
				unique: unique
			})
		}else{
			res.render('nuevousuario', { 
				user: req.user,
	            message: '',
	            errors: errors,
	            unique: unique
	        });
		}
    }); 
});

router.get('/listusers', isLoggin, function(req, res, next){
	Usuario.find(function(err, usuarios){
		if(err) return next(err);
		res.render('listausuarios', {
			user: req.user,
			usuarios: usuarios
		});
	}).sort({nombres: -1});
});

router.post('/listusers/eliminar/:id', function(req, res){
	let idusr = req.params.id;
	Usuario.findById(idusr, function(err, usuario){
		if(err) return res.status(500).send({messageError: "Error al eliminar el usuario"});
		usuario.remove(function(err){
			if(err) return "No se pudo eliminar el usuario";
			console.log("El usuario ha sido correctamente eliminado");
			Usuario.find((err, usuarios)=>{
				if(err) return "Lista de usuarios no existente";
				res.render('listausuarios', {
					user: req.user,
					usuarios: usuarios
				});
			});
		});
	});
});

router.get('/listusers/editar/:id', function(req, res){
	let idusr = req.params.id;
	Usuario.findById(idusr, function(err, usuario){
		res.render('editarusuario', { 
			user: req.user,
	        message: '',
	        errors: '',
	        unique: '',
	        usuario: usuario
		});
	});
});

router.post('/listusers/editar/item/:id', function(req, res, next){
	let idusr = req.params.id;
	console.log(idusr);
	req.assert('nombres', 'El campo nombres es necesario').notEmpty();
	req.assert('paterno', 'El campo apellido paterno es necesario').notEmpty();
	req.assert('materno', 'El campo apellido materno es necesario').notEmpty();
	if(!req.body.newpassword == ''){
		console.log("El password es distinto de vacio");
		req.assert('newpassword', 'El nuevo password debe contener minimo 5 caracteres').isLength({min:5, max:undefined});
		req.assert('newpassword', 'Los passwords no coninciden').equals(req.body.newpasswordConfirm);
	} 
	var errors = req.validationErrors();
	Usuario.findById(idusr, function(err, usuario){
		if(err) return "error";
		if(usuario){
			if(!errors){
				console.log("Existe el usuario");
				//Encripta el password y se guarda en la variable passNuevo
		    	if(!req.body.newpassword != ''){
		    		Usuario.findOneAndUpdate({_id: idusr}, {
			    		nombres: req.body.nombres,
			    		apPaterno: req.body.paterno,
			    		apMaterno: req.body.materno,
			    	}, (err, doc)=>{
			    		if(err) return "No se pudo actualizar el documento";
			    		console.log(`El documeto ha sido actualizado correctamente = ${doc}`);
			    		Usuario.findById(idusr, (err, usr)=>{
			    			res.render('editarusuario', { 
								user: req.user,
						        message: `El usuario ha sido actualizado correctamente`,
						        errors: '',
						        unique: '',
						        usuario: usr
							});
			    		});
			    	});
		    	}
		    	else{
		    		let usr = new Usuario();
		    		let passNuevo = usr.encryptPassword(req.body.newpassword);
		    		Usuario.findOneAndUpdate({_id: idusr}, {
			    		nombres: req.body.nombres,
			    		apPaterno: req.body.paterno,
			    		apMaterno: req.body.materno,
			    		password: passNuevo
			    	}, (err, doc)=>{
			    		if(err) return "No se pudo actualizar el documento";
			    		Usuario.findById(idusr, (err, usr)=>{
			    			res.render('editarusuario', { 
								user: req.user,
						        message: `El usuario ha sido actualizado correctamente`,
						        errors: '',
						        unique: '',
						        usuario: usr
							});
			    		});
			    	});
		    	}
	    	}
	    	else{
	    		res.render('editarusuario', { 
					user: req.user,
			        message: ``,
			        errors: errors,
			        unique: '',
			        usuario: usuario
				});
	    	}
		}
		else{
			console.log("no exite el usuario");
			next();
		}
	});	
});

router.get('/history', isLoggin, function(req, res){
	res.render('historial', {user: req.user});
});

module.exports = router;

function isLoggin(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}