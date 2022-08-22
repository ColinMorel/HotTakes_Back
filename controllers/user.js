const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

//Premiere chose à faire, on hash le mdp(fct asyncrone qui prends du temps). Puis on enregistrera le user dans la database
exports.signup =(req,res,next)=>{//creation de nouveau user dans la database à partir de l'inscription de l'app frontend
    bcrypt.hash(req.body.password,10)// 10 corresponds au salt, nb de fois qu'on execute l'algo de hashage. 10 tours suffisent pour créer mdp sécurisé. Pas trop long non plus
    .then(hash => {//On prends le mdp crypté, on crée un new user avec le mdp crypté et l'adresse mail
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()//Puis on save cet user dans la database
            .then(()=>res.status(201).json({message: 'Utilisateur crée'}))
            .catch(error => res.status(400).json({error}));
    })
    .catch(error=>res.status(500).json({error}));
};

exports.login = (req, res, next)=>{
    User.findOne({email: req.body.email}) // On recupere l'user de la database qui corréspond à l'email entré
        .then(user =>{
            if(!user){ // si on n'a pas d'user, alors erreur
                res.status(401).json({error:'Utilisateur non trouvé!'});
            }
            bcrypt.compare(req.body.password, user.password) // on compare le mdp entré avec le hash qui est dans la database
                .then(valid => {
                    if(!valid){ // Si comparaison pas bonne, on renvoi erreur
                        res.status(401).json({error:'Mot de passe incorrect !'});
                    }
                    res.status(200).json({ // Si comparaison bonne, on renvoit son user id, et un token (qui sera le token d'authentification)
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},//données qu'on veut encoder (si on veut ) = payload, clé secrete pour l'encodage , expiration du token
                            process.env.SECRET_TOKEN,
                            { expiresIn:('24h')}
                        ) //le token d'authentification renvoyé pour identifier l'user
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};