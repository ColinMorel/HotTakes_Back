const multer = require('multer');

const MIME_TYPES = { // pour les format des images, auquel on a accès
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) =>{
      callback(null, 'images')
    },
    filename: (req, file, callback) =>{
        const name = file.originalname.split(' ').join('_');//partie avant extension, on remplace les espaces dans les noms par des _
        const extension = MIME_TYPES[file.mimetype];//On crée donc l'extension du fichier qui sera l'élement de notre dictionnaire, correspondant au mime type du fichier envoyé par le front
        callback(null, name + Date.now()) + '.' + extension;//ajout du time stamp dans le nom pour rendre le fichier unique
    }
});

module.exports = multer({storage}).single('image');//export du middleware multer, en y indiquant que c'est un fichier unique, de type image