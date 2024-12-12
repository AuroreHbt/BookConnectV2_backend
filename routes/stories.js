const express = require('express');
const router = express.Router();

// Créer un fichier avec un nom aléatoire via le module uniqid
const uniqid = require('uniqid');

// import Cloudinary, url dans le fichier .env
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Module pour gérer les extensions
const mime = require('mime-types');

// import du Model
const Story = require('../models/stories');
const User = require('../models/users')

// Routes pour poster une nouvelle histoire 

router.post('/addstory', async (req, res) => {
    try {
        
        console.log("Requête reçue - req.body :", req.body); // Champs textuels
        console.log("Requête reçue - req.files :", req.files); // Fichiers envoyés

        // Déstructuration des champs textuels
        const { author, title, isAdult, category, description } = req.body;

        // Vérification que l'auteur est fourni
        if (!author) {
            console.log("Auteur non fourni dans la requête.");
            return res.json({ result: false, error: "Auteur non spécifié." });
        }

        // Log des champs textuels reçus
        console.log("Auteur reçu :", author);
        console.log("Titre :", title);
        console.log("Adulte :", isAdult);
        console.log("Description :", description);
        console.log("Catégorie :", category);

        // Validation des champs obligatoires
        if (!title || !isAdult || !description || !category) {
            console.log("Champs obligatoires manquants :", {
                title, isAdult, description, category
            });
            return res.json({ result: false, error: 'Les champs obligatoires ne sont pas remplis.' });
        }

        // Recherche de l'utilisateur dans la base de données
        const user = await User.findOne({ username: author });
        if (!user) {
            console.log("Auteur introuvable dans la base de données :", author);
            return res.json({ result: false, error: 'Auteur non trouvé.' });
        }

        console.log("Utilisateur trouvé :", user);

        
        let coverImage = null; // URL de l'image de couverture (si fournie)
        let storyFile = null; // URL du fichier texte (si fourni)

        // Vérification et traitement des fichiers envoyés
        if (req.files) {
            console.log("Fichiers reçus :", req.files);

            // Traitement de l'image de couverture si présente
            if (req.files.coverImage) {
                console.log("Traitement de l'image de couverture...");
                const imgFile = req.files.coverImage;
                const imgFileExtension = mime.extension(imgFile.mimetype);
                console.log("Extension de l'image :", imgFileExtension);

                // Vérification des extensions valides pour les images
                const imgValidExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                if (!imgValidExtensions.includes(imgFileExtension)) {
                    console.log("Type d'image non pris en charge :", imgFileExtension);
                    return res.json({ result: false, error: 'Type de fichier image non pris en charge' });
                }

                // Chemin temporaire pour stocker l'image
                const coverPath = `./tmp/${uniqid()}.${imgFileExtension}`;
                await imgFile.mv(coverPath);
                console.log("Fichier temporaire déplacé :", coverPath);

                // Upload de l'image sur Cloudinary
                const resultCloudinaryCover = await cloudinary.uploader.upload(coverPath);
                console.log("Image uploadée sur Cloudinary :", resultCloudinaryCover.secure_url);

                // Suppression du fichier temporaire local
                fs.unlinkSync(coverPath);
                console.log("Fichier temporaire supprimé :", coverPath);

               
                coverImage = resultCloudinaryCover.secure_url;
            }

            // Traitement du fichier texte
            if (req.files.storyFile) {
                console.log("Traitement du fichier texte...");
                const txtFile = req.files.storyFile;
                const txtFileExtension = mime.extension(txtFile.mimetype);
                console.log("Extension du fichier texte :", txtFileExtension);

                // Vérification des extensions valides pour les fichiers texte
                const txtValidExtensions = ['pdf', 'docx', 'txt'];
                if (!txtValidExtensions.includes(txtFileExtension)) {
                    console.log("Type de fichier texte non pris en charge :", txtFileExtension);
                    return res.json({ result: false, error: 'Type de fichier texte non pris en charge' });
                }

                // Chemin temporaire pour stocker le fichier texte
                const contentPath = `./tmp/${uniqid()}.${txtFileExtension}`;
                await txtFile.mv(contentPath);
                console.log("Fichier temporaire déplacé :", contentPath);

                // Upload du fichier texte sur Cloudinary
                const resultCloudinaryContent = await cloudinary.uploader.upload(contentPath);
                console.log("Fichier texte uploadé sur Cloudinary :", resultCloudinaryContent.secure_url);

                // Suppression du fichier temporaire local
                fs.unlinkSync(contentPath);
                console.log("Fichier temporaire supprimé :", contentPath);

                // Mise à jour de l'URL du fichier texte
                storyFile = resultCloudinaryContent.secure_url;
            }
        } else {
            console.log("Aucun fichier reçu.");
        }

<<<<<<< HEAD
            // attribution d'un id unique pour save dans cloudinary
            const coverPath = `./tmp/${uniqid()}.${imgFileExtension}`;
            const contentPath = `./tmp/${uniqid()}.${txtFileExtension}`;
            console.log(coverPath);
            console.log(contentPath);

            // Déplacer le fichier temporairement sur le backend (dossier tmp)
            const resultMoveCover = await req.files.coverImage.mv(coverPath);
            const resultMoveContent = await req.files.storyFile.mv(contentPath);

            // Charger le fichier sur Cloudinary 
            const resultCloudinaryCover = await cloudinary.uploader.upload(coverPath);
            const resultCloudinaryContent = await cloudinary.uploader.upload(contentPath);

            // Puis supprimer les fichiers temporaires en local
            fs.unlinkSync(coverPath);
            fs.unlinkSync(contentPath);

            // Mise à jour des URL des fichiers image et texte
            coverImage = resultCloudinaryCover.secure_url;
            storyFile = resultCloudinaryContent.secure_url;
            console.log(coverImage);
            console.log(storyFile);
        };

        // Création de l'évènement avec ou sans image
=======
        // Création d'un nouvel objet histoire
>>>>>>> 751c4082584b97023c7fcff2388f92bc083677d0
        const newStory = new Story({
            author: user._id, // Utilisation de l'ID MongoDB de l'utilisateur
            title,
            isAdult,
            category,
            description,
            coverImage,
            storyFile,
        });

        console.log("Nouvelle histoire à sauvegarder :", newStory);

        // Sauvegarde de l'histoire dans la base de données
        const savedStory = await newStory.save();
        console.log("Histoire sauvegardée :", savedStory);
        res.json({ result: true, message: 'Histoire publiée avec succès', story: savedStory });
    } catch (error) {
        console.error("Erreur lors de la publication de l'histoire :", error);
    }
});

// Route pour chercher les nouvelles histoires postées en fonction de l'auteur

router.get('/mypublishedstory/:author', (req, res) => {
    console.log('Requête reçue pour auteur :', req.params.author);
    
    // Recherche de l'utilisateur dans la base de données
    User.findOne({ username: req.params.author })
    .then(user => {
      // Si aucun utilisateur trouvé, renvoie une erreur
      if (!user) {
        return res.json({ result: false, error: 'Auteur non trouvé' }); 
      }
      // Si l'utilisateur est trouvé, rechercher toutes les histoires associées à son ID
      Story.find({author : user._id})
        .populate('author', ['username', 'email']) // Remplit les détails de l'auteur (nom d'utilisateur et email) pour chaque histoire
        .populate('category')
        .sort({ createdAt: 'desc' }) // Trie les histoires par ordre décroissant de date de création
        .then(stories => {
            console.log('histoires trouvées :');
            res.json({ result: true, stories }); // Renvoyer les histoires trouvées
        });
    });
});


module.exports = router;



