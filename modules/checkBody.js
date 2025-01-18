// Fonction pour vérifier si tous les champs requis d'un formulaire ou d'une requête HTTP sont présents et non vides.

function checkBody(body, keys) {
  // deux paramètres : body = un objet contenant les données à vérifier | keys = un tableau contenant les noms des champs à valider

  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
      // Si le champ n'existe pas dans l'objet body ou s'il est une chaîne vide, isValid passe à false.
    }
  }

  return isValid;
}

module.exports = { checkBody };
