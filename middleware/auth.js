const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{    // plusieurs elements qui peuvent poser probleme, donc si moindre erreur sur moindre ligne, on veut les gerer dans le bloc catch
        const token = req.headers.authorization.split(' ')[1];//On recupere le token, et on split au niveau de l'espace (' '), on prends le 2e element, donc le token crypté
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN); // clé qui correspond à la clé secrete du login
        const userId = decodedToken.userId;

        req.auth = userId;//On ajoute le userId(en valeur à userId) à la req.auth, pour pouvoir faire comparaison dans le deleteThing 
        //On y aura donc accès avec req.auth.userId(qui donnera l'userId)

        if(req.body.userId && req.body.userId !== userId){// Si on a un user id dans la requete, ET qu'il est différent de userId, alors erreur
            throw 'UserID non valable !';
        } else{
            next(); // pour chaque requete sur une route protégée, on passe par ce middleware. Si on arrive ici, on peut passer la requete au prochain Middleware
        }
    } catch (error){                            
        res.status(401).json({error: error | 'Requête non authentifiée !'}); // si erreur sur autre ligne que dans le try, ça renvoit "Requete non authentifiée"
    }
};
