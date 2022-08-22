require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path'); 

const helmet = require('helmet');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

mongoose.connect(process.env.SECRET_DB,
{ useNewUrlParser: true,
    useUnifiedTopology: true})
.then(()=> console.log(' Connexion à MongoDB réussie! '))
.catch(()=> console.log(' Connexion à MongoDB échouée! '));

app.use(express.json());//intercepte les requetes qui contiennent du json, et met à disposition ce contenus(core) de la requete, et le met sur core.body

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');//toute les origines avec *
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    // res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header("Set-Cookie: cross-site-cookie=whatever; SameSite=None; Secure");//Un cookie Secure ne sera envoyé au serveur que par le biais de requêtes utilisant le protocole HTTPS
    next();
});

app.disable('x-powered-by');//masquer l'utilisation aux pirates potentiels
// app.use(helmet.crossOrigineResourcePolicy({policy : "same-site"}));
app.use(helmet({
    crossOrigineResourcePolicy: false,
}));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces',saucesRoutes);
app.use('/api/auth', userRoutes);
module.exports = app; //Exporter l'application/constante pour y accéder depuis les autres fichiers du projet ( notamment le serv node )