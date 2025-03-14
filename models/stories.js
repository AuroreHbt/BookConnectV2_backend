const mongoose = require('mongoose');

const storySchema = mongoose.Schema({
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // 🔹 Auteur de l'histoire
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // 🔹 Liste des utilisateurs ayant liké
    createdAt: { type: Date, default: Date.now }, // 🔹 Date de création
    title: { type: String, required: true }, // 🔹 Titre de l'histoire
    isAdult: { type: Boolean, default: false }, // 🔹 Contenu adulte ?
    category: String, // 🔹 Catégorie de l'histoire
    description: String, // 🔹 Description de l'histoire
    coverImage: String, // 🔹 URL de la couverture
    storyFile: String, // 🔹 URL du fichier PDF

    // 🔹 Votes et notes
    votes: { type: Number, default: 0 }, // 🔹 Nombre total de votes
    rating: { type: Number, default: 0 }, // 🔹 Note moyenne de l'histoire

    // 🔹 Liste des utilisateurs ayant voté avec leurs notes
    voters: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // 🔹 ID de l'utilisateur ayant voté
            rating: Number, // 🔹 Note attribuée
        }
    ],
});

const Story = mongoose.model('stories', storySchema);
module.exports = Story;
