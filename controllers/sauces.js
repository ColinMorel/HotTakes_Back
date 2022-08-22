const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        likes:0,
        dislikes:0,
        usersLiked:[],
        usersDisliked:[],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`// protocole://nom d'host/images/nomdufichier
    });
    sauce.save()
    .then(res.status(201).json({message:'Sauce bien enregistrée !'}))
    .catch(error=> res.status(400).json(error));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? // test de si le file existe :
    {
        ...JSON.parse(req.body.sauce),//On récupere les infos sur l'objet qui sont dans la partie de la requete
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`// protocole://nom d'host/images/nomdufichier
    } : { ...req.body}; // s'il existe, alors on fait {1}, sinon, alors on fait {2}
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id }) //On maj la thing de la databse. Avec 2 arg : objet de comparaison, pour savoir lequel on modifie
    .then( () => res.status(200).json({message:'Objet bien modifié!'}))          //(celui dont l'id est celui de la requete), et le 2e c'est la nouvel version de l'objet avec l'id identique à celui de la requete, on est certain d'avoir le bon
    .catch( error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
   Sauce.findOne({_id: req.params.id})
        .then(sauce =>{
            if(sauce.userId !== req.auth){
                return res.status(401).json({error: new Error('Requête non authorisée !')})
            }
            const filename = sauce.imageUrl.split(`/images/`)[1];
            fs.unlink(`images/${filename}`, () => {// 1: chemin du fichier, 2: le callback
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce bien supprimée !'}))
                    .catch(error => res.status(400).json({error}));
            });
        }) 
        .catch(error => res.status(500).json({error}));
};

exports.getAllSauces = (req,res,next)=>{
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error=> res.status(400).json({error}));
};

exports.getOneSauce =  (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // On compare l'id de la sauce(objet en vente) soit le même que le parametre de la requete
        .then(sauces => res.status(200).json(sauces))
        .catch(error=> res.status(404).json({error}));
};

exports.likeDislikeSauce = (req, res, next ) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;

    Sauce.findOne({_id: sauceId})
        .then((sauce) => {
            const ArrayLikes = sauce.usersLiked;
            const ArrayDislikes = sauce.usersDisliked;
            if(!ArrayLikes.includes(userId) && !ArrayDislikes.includes(userId)){                
                switch(like){
                    case 1:
                        console.log("Sauce aimé avec succès");
                        ArrayLikes.push(userId);
                        console.log(ArrayLikes);
                        sauce.likes++;
                        console.log(sauce.likes);
                        sauce.save()
                            .then(() => res.status(200).json({message:"Like ajouté!"}))
                            .catch(error => res.status(500).json({error}));
                        break;
                    case 0:
                        console.log("Case 0");
                        break;
                    case -1:
                        console.log("Sauce non aimé avec succès");
                        ArrayDislikes.push(userId);
                        sauce.dislikes++;
                        console.log(sauce.dislikes);
                        sauce.save()
                            .then(() => res.status(200).json({message:"Dislike ajouté!"}))
                            .catch(error => res.status(500).json({error}));
                        console.log("save réussis")
                        break;
                    default: console.log("WEIRD");
                }
                console.log("switch réussis");
            }else if (ArrayLikes.includes(userId)){
                console.log("La sauce est aimé");
                switch(like){
                    case 0:
                        console.log("Case 0");
                        let pos = ArrayLikes.indexOf(userId);
                        ArrayLikes.splice(pos,1);
                        sauce.likes --;
                        console.log(sauce.likes);
                        sauce.save()
                                .then(() => res.status(200).json({message:"Like retiré!"}))
                                .catch(error => res.status(500).json({error}));
                        break;
                    default:console.log("La sauce est deja aimé,impossible!");
                } 
            }else if(ArrayDislikes.includes(userId)){
                console.log("La sauce est deja non aimé");
                switch(like){
                    case 0:
                        console.log("Case 0");
                        let pos = ArrayDislikes.indexOf(userId);
                        ArrayDislikes.splice(pos,1);
                        sauce.dislikes--;
                        console.log(sauce.dislikes)
                        sauce.save()
                                .then(() => res.status(200).json({message:"Dislike retiré!"}))
                                .catch(error => res.status(500).json({error}));
                        console.log("save réussis");
                        break;
                    default:console.log("La sauce est deja aimé,impossible!");
                }
            }
            else{console.log("Marche pas?")}

            sauce.usersLiked = ArrayLikes;
            sauce.usersDisliked = ArrayDislikes;

            console.log("test fin fonction");
            
            // A ENLEVER CAR ERREUR Cannot set headers after they are sent to the client
            // Sauce.updateOne({_id: sauceId},{like})
            //     .then(res.status(201).json({message:'Bien enregistrée !'}))
            //     .catch(error=> res.status(400).json(error));
        })
        .catch(error=> res.status(500).json(error));   
};
