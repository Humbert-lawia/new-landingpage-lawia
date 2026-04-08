// ═══ NAV SCROLL — debounced via rAF ═══
(function(){
  var ticking = false;
  var nav = document.querySelector('nav');
  window.addEventListener('scroll', function(){
    if (!ticking) {
      requestAnimationFrame(function(){
        nav.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

// ═══ SMOOTH SCROLL — offset pour nav fixe ═══
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var href = a.getAttribute('href');
    if (href === '#') return;
    var t = document.querySelector(href);
    if (t) {
      var navHeight = document.querySelector('nav').offsetHeight;
      var y = t.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ═══ SKILL CARDS CLICK ANIMATION ═══
(function(){
  var previews = [
    ['En-tête : tribunal, chambre, RG, parties', 'Exposé des faits chronologique structuré', 'Discussion — fondements juridiques applicables', 'Qualification préjudices + postes DINTHILLAC', 'Dispositif + bordereau de pièces intégré'],
    ['Désignation de la juridiction compétente', 'Exposé des faits + historique de procédure', 'Moyens en droit : illégalité externe / interne', 'Conclusions au fond + demandes accessoires', 'Pièces jointes numérotées + bordereau'],
    ['Cartographie des arguments adverses', 'Failles procédurales + irrecevabilités', 'Contre-arguments juridiques sourcés', 'Auto-vérification : zéro hallucination', 'Synthèse rédigée prête à insérer'],
    ['Structure : faits, procédure, prétentions', 'Rappel du jugement + critiques motivées', 'Discussion des moyens du premier juge', 'Dispositif conforme R.954-1 CPC', 'Tableau récapitulatif des chefs de demande'],
    ['Identification parties + objet de la mission', 'Forfait / Taux horaire / Résultat / Mixte', 'Modalités de paiement + provisions', 'Clause de révision + rupture de mandat', 'Mentions CNB obligatoires + signature']
  ];

  document.querySelectorAll('.skill-card').forEach(function(card, i){
    var hint = document.createElement('span');
    hint.className = 'skill-card-hint';
    hint.textContent = '↓ Cliquer pour aperçu';
    card.appendChild(hint);

    var items = previews[i] || [];
    var inner = document.createElement('div');
    inner.className = 'skill-preview';
    inner.innerHTML = '<div class="skill-preview-inner">'
      + '<div class="sprev-label">Aperçu du contenu</div>'
      + items.map(function(txt, j){
          return '<div class="sprev-item' + (j >= 2 ? ' lock' : '') + '">' + txt + '</div>';
        }).join('')
      + '<span class="sprev-unlock">\uD83D\uDD12 3 sections déverrouillées à l\'achat</span>'
      + '</div>';
    card.appendChild(inner);

    card.addEventListener('click', function(e){
      if(e.target.closest('.skill-link')) return;
      var isOpen = card.classList.contains('expanded');
      document.querySelectorAll('.skill-card.expanded').forEach(function(c){ c.classList.remove('expanded'); });
      if(!isOpen){
        card.classList.add('expanded', 'clicked');
        hint.textContent = '↑ Réduire';
        card.addEventListener('animationend', function(){ card.classList.remove('clicked'); }, { once: true });
      } else {
        hint.textContent = '↓ Cliquer pour aperçu';
      }
    });
  });
})();

// ═══ HERO CAROUSEL ═══
(function(){
  var slides = document.querySelectorAll('#heroCarousel .carousel-slide');
  var dots   = document.querySelectorAll('#heroCarousel .cdot');
  if (!slides.length || !dots.length) return;
  var cur = 0, timer;

  function goTo(n){
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
  }

  function next(){ goTo(cur + 1); }

  function startTimer(){ timer = setInterval(next, 3500); }
  function resetTimer(){ clearInterval(timer); startTimer(); }
  function stopTimer(){ clearInterval(timer); }

  // Pause carousel quand l'onglet est masque
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { stopTimer(); } else { resetTimer(); }
  });

  dots.forEach(function(d){ d.addEventListener('click', function(){ goTo(+d.dataset.idx); resetTimer(); }); });
  startTimer();
})();
