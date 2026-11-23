/* Thisdale — envoi des demandes vers GoHighLevel et mémoire des témoins */
// ▼▼ À REMPLIR PAR GABRIEL : l'URL du webhook entrant de GHL (Automation > Workflow > déclencheur « Inbound Webhook »)
var GHL_WEBHOOK_URL = '';
// ▲▲

(function () {
  var FR = document.documentElement.lang !== 'en';
  var LEAD = { 'Individuel': 'Individuel', 'Moi seulement': 'Individuel', 'Individual': 'Individuel', 'Just me': 'Individuel',
    'Couple': 'Couple', 'Mon conjoint et moi': 'Couple', 'My spouse and me': 'Couple',
    'Monoparental': 'Monoparental', 'Single parent': 'Monoparental', 'Familial': 'Famille', 'Family': 'Famille' };

  // Témoins : le choix est mémorisé; les outils de mesure ne se chargent qu'après « Accepter ».
  function cookieChoice() { try { return localStorage.getItem('thisdale-cookies'); } catch (e) { return null; } }
  function saveChoice(v) { try { localStorage.setItem('thisdale-cookies', v); } catch (e) {} if (v === 'accepted') loadTrackers(); }
  function loadTrackers() {
    // Gabriel : coller ici le chargement de Google Analytics / pixel Meta. Ne s'exécute qu'avec le consentement.
  }

  function val(id) { var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; }
  function checked(id) { var e = document.getElementById(id); return !!(e && e.checked); }

  function submit(c) {
    var msg = '';
    var email = val('courriel'), phone = val('tel').replace(/\D/g, '');
    if (!val('prenom') || !val('nom')) msg = FR ? 'Veuillez inscrire votre prénom et votre nom.' : 'Please enter your first and last name.';
    else if (phone.length < 10) msg = FR ? 'Veuillez inscrire un numéro de téléphone valide.' : 'Please enter a valid phone number.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = FR ? 'Veuillez inscrire un courriel valide.' : 'Please enter a valid email.';
    else if (!c.state.fTime) msg = FR ? 'Veuillez indiquer le meilleur moment pour vous joindre.' : 'Please choose the best time to reach you.';
    else if (!checked('consent-main')) msg = FR ? 'Veuillez accepter le traitement de vos renseignements pour envoyer votre demande.' : 'Please accept the processing of your information to send your request.';
    if (msg) { c.setState({ err3: msg }); return; }

    var st = c.state, mem = st.members || [];
    var data = {
      first_name: val('prenom'), last_name: val('nom'), phone: val('tel'), email: email,
      produit: st.fProduct || '', lead_type: LEAD[st.fWho] || '', pour_qui: st.fWho || '',
      age_demandeur: '', age_conjoint: '', fumeur_demandeur: '', fumeur_conjoint: '',
      collectif_90_jours: st.fGroup || '', nombre_employes: st.fEmp || '', moment_prefere: st.fTime || '',
      consentement_traitement: 'oui', consentement_marketing: checked('consent-marketing') ? 'oui' : 'non',
      consentement_date: new Date().toISOString(), langue: FR ? 'fr' : 'en', page: location.href
    };
    var k = 0;
    mem.forEach(function (m) {
      if (m.role === 'adult') { data.age_demandeur = m.age; data.fumeur_demandeur = m.smoker || ''; }
      else if (m.role === 'spouse') { data.age_conjoint = m.age; data.fumeur_conjoint = m.smoker || ''; }
      else { k++; data['age_enfant_' + k] = m.age; }
    });
    data.nombre_enfants = String(k);
    if (GHL_WEBHOOK_URL) {
      fetch(GHL_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) }).catch(function () {});
    } else if (window.console) { console.log('Demande (webhook GHL non configuré) :', data); }
    c.setState({ step: 4, err3: '' });
  }

  window.ThisdaleHooks = {
    init: function (c) {
      if (cookieChoice()) { c.state.showCookies = false; if (cookieChoice() === 'accepted') loadTrackers(); }
      var orig = c.renderVals.bind(c);
      c.renderVals = function () {
        var v = orig();
        v.err3 = c.state.err3 || '';
        v.submit = function () { submit(c); };
        if (v.acceptCookies) v.acceptCookies = function () { saveChoice('accepted'); c.setState({ showCookies: false }); };
        if (v.refuseCookies) v.refuseCookies = function () { saveChoice('refused'); c.setState({ showCookies: false }); };
        return v;
      };
    }
  };
})();
