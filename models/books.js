const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    author: String, // foreign key : auteur du livre
    editor: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], // foreign key : tableau des users qui ont liké le livre pour l'acheter plus tard
    publication: Date,
    title: String,
    isAdult: Boolean, // par défaut = false
    category: String,
    description: String, // 4e de couv
    picture: String, // url de l'image (au moins 1 obligatoire ?)
});

const Book = mongoose.model('stories', bookSchema);
module.exports = Book;
