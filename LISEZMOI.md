# Site Thisdale — mise en ligne sur GitHub Pages

Le dossier contient le site complet, prêt à publier :

| Fichier | Page |
| --- | --- |
| index.html | Accueil (français) — thisdale.ca |
| en.html | Accueil (anglais) — thisdale.ca/en.html |
| confidentialite.html | Politique de confidentialité |
| privacy.html | Privacy Policy |
| assets/ | Photos et icône du site |
| runtime.js, site.js | Fonctionnement du comparateur, du formulaire et de l'assistant |
| CNAME | Indique à GitHub le domaine thisdale.ca |

## 1. Publier sur GitHub (10 minutes, sans logiciel)

1. Sur github.com, cliquez **New repository**. Nom : `thisdale-site`. Visibilité : **Public** (obligatoire pour GitHub Pages gratuit). Cliquez **Create repository**.
2. Cliquez **uploading an existing file**, puis glissez **tout le contenu** du dossier (les fichiers et le dossier `assets`, pas le dossier parent). Cliquez **Commit changes**.
3. Allez dans **Settings > Pages**. Sous *Build and deployment*, choisissez **Deploy from a branch**, branche **main**, dossier **/ (root)**, puis **Save**.
4. Toujours dans **Settings > Pages**, à *Custom domain*, inscrivez `thisdale.ca` et cliquez **Save**.

## 2. Brancher thisdale.ca chez GoDaddy

Dans GoDaddy : **Mes produits > Domaines > thisdale.ca > DNS**.

1. Supprimez l'enregistrement **A** existant dont le nom est `@` (souvent « Parked »).
2. Ajoutez 4 enregistrements **A**, nom `@`, chacun avec une de ces valeurs :
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
3. Modifiez (ou ajoutez) l'enregistrement **CNAME** nommé `www` pour qu'il pointe vers `VOTRE-NOM-GITHUB.github.io`.
4. Attendez de quelques minutes à quelques heures. Retournez dans **Settings > Pages** sur GitHub et cochez **Enforce HTTPS** dès que l'option devient disponible.

## 3. Brancher le formulaire sur GoHighLevel (Gabriel)

1. Dans GHL, créer un workflow avec le déclencheur **Inbound Webhook** et copier son URL.
2. Dans `site.js`, coller l'URL entre les guillemets de la ligne `var GHL_WEBHOOK_URL = '';`, puis téléverser le fichier modifié sur GitHub.
3. Faire une demande test, puis associer les champs reçus aux champs GHL et poser les étiquettes. Champs envoyés : first_name, last_name, phone, email, produit, lead_type, pour_qui, age_demandeur, age_conjoint, age_enfant_1 à n, nombre_enfants, fumeur_demandeur, fumeur_conjoint, collectif_90_jours, nombre_employes, moment_prefere, consentement_traitement, consentement_marketing, consentement_date, langue, page.

Tant que l'URL est vide, le formulaire affiche le message de remerciement, mais **aucune demande n'est transmise**. Ne pas annoncer le site avant cette étape.

## 4. Outils de mesure (facultatif)

Google Analytics ou le pixel Meta se collent dans la fonction `loadTrackers()` de `site.js`. Ils ne se chargent qu'après un clic sur « Accepter » dans le bandeau des témoins (Loi 25).
