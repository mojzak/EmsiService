const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser les formulaires urlencoded et JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fichiers statiques (images, styles)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servir la favicon par défaut pour tous les navigateurs
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'images', 'favicon.svg'));
});

// Base de données simulée pour les étudiants
const studentsDatabase = {
  "CC-2026-26190567": {
    nomPrenom: "HAJJIA ILHAM",
    matricule: "CC-2026-26190567",
    email: "ilham.hajjia@emsi-edu.ma",
    filiere: "Ingénierie Informatique et Réseaux",
    niveau: "4ème année",
    groupe: "4IIRM G6 (26-27) - G62 (26-27)",
    campus: "EMSI HASSAN"
  }
};

// Route 1 : Page d'accueil / Formulaire de vérification (GET /)
app.get('/', (req, res) => {
  const error = req.query.error || null;
  res.sendFile(path.join(__dirname, 'views', 'verification.html'));
});

// Route 2 : Traitement de la vérification (POST /verify)
app.post('/verify', (req, res) => {
  const { code, captchaVerified } = req.body;

  // Validation du Captcha
  if (captchaVerified !== 'true' && captchaVerified !== true) {
    return res.status(400).json({
      success: false,
      message: "Veuillez valider le Captcha."
    });
  }

  // Nettoyage et vérification du code
  const cleanCode = (code || '').trim().toUpperCase();
  const student = studentsDatabase[cleanCode];

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Code invalide. Aucun document référentiel ne correspond à ce code."
    });
  }

  // Redirection ou réponse réussie vers la page de détails
  return res.json({
    success: true,
    redirectUrl: `/etudiant?code=${encodeURIComponent(cleanCode)}`
  });
});

// Route 3 : Page d'affichage des données de l'étudiant (GET /etudiant)
app.get('/etudiant', (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  const student = studentsDatabase[code];

  if (!student) {
    return res.redirect('/?error=invalid_code');
  }

  res.sendFile(path.join(__dirname, 'views', 'etudiant.html'));
});

// Endpoint API pour récupérer les données de l'étudiant de manière sécurisée
app.get('/api/student/:code', (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const student = studentsDatabase[code];

  if (!student) {
    return res.status(404).json({ success: false, message: 'Étudiant introuvable' });
  }

  return res.json({ success: true, data: student });
});

app.listen(PORT, () => {
  console.log(`Serveur EMSI démarré avec succès sur http://localhost:${PORT}`);
});
