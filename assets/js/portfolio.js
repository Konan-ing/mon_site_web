/**
 * portfolio.js - Logique générique pour Konan Kramo
 */
let listeProjets = [];

async function chargerProjets() {
  const grid = document.querySelector('#portfolio-grid');
  const sectionPortfolio = document.querySelector('.portfolio');
  if (!grid) return;

  try {
    const resp = await fetch('projets.json');
    if (!resp.ok) throw new Error("Fichier projets.json introuvable");
    listeProjets = await resp.json();

    // Injection du HTML
    grid.innerHTML = listeProjets.map((p, index) => {
      // Boutons Repo/Démo conditionnels
      const repoBtn = p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" class="btn btn-dark btn-sm flex-fill"><i class="bi bi-github"></i> Code</a>` : '';
      const demoBtn = p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="btn btn-info btn-sm flex-fill text-white"><i class="bi bi-eye"></i> Démo</a>` : '';

      // Action dynamique (IA, Vidéo, etc.)
      let zoneAction = '';
      if (p.action) {
        if (p.action.type === 'test_api') {
          zoneAction = `
            <div class="mt-3 p-2 border-top">
              <label class="small text-muted mb-1">${p.action.label}</label>
              <input type="text" id="input-${index}" class="form-control form-control-sm mb-2" placeholder="${p.action.placeholder}">
              <button onclick="executerAction(${index})" class="btn btn-primary btn-sm w-100">${p.action.bouton}</button>
              <p id="res-${index}" class="mt-2 small mb-0 text-center"></p>
            </div>`;
        } else if (p.action.type === 'lien_externe') {
          zoneAction = `<a href="${p.action.url}" target="_blank" class="btn btn-outline-primary btn-sm w-100 mt-2">${p.action.label}</a>`;
        }
      }

      return `
        <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${p.categorie || ''}">
          <div class="portfolio-content h-100 p-3 border rounded shadow-sm">
            <img src="${p.image}" class="img-fluid mb-3" alt="${p.nom}" loading="lazy">
            <h4>${p.nom}</h4>
            <p class="small text-muted">${p.description || ''}</p>
            <div class="d-flex gap-2">${repoBtn}${demoBtn}</div>
            ${zoneAction}
          </div>
        </div>`;
    }).join('');

    // --- LOGIQUE DE FILTRAGE ---
    // On attend que les images soient chargées pour initialiser Isotope
    imagesLoaded(grid, function() {
      let iso = new Isotope(grid, {
        itemSelector: '.portfolio-item',
        layoutMode: 'masonry',
        filter: '*'
      });

      // On lie les boutons de filtre de l'index.html à Isotope
      const filterButtons = document.querySelectorAll('.portfolio-filters li');
      filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          // Gère l'apparence active
          document.querySelector('.portfolio-filters .filter-active').classList.remove('filter-active');
          this.classList.add('filter-active');
          
          // Applique le filtre
          iso.arrange({ filter: this.getAttribute('data-filter') });
          
          // Rafraîchit les animations AOS si présentes
          if (window.AOS) window.AOS.refresh();
        });
      });
    });

  } catch (e) {
    console.error("Erreur :", e);
    grid.innerHTML = "<p class='text-danger'>Erreur de chargement des projets.</p>";
  }
}

// Fonction générique pour les actions (IA ou autre)
async function executerAction(index) {
  const p = listeProjets[index];
  const inputVal = document.getElementById(`input-${index}`).value;
  const resField = document.getElementById(`res-${index}`);

  if (!inputVal) return;
  resField.innerText = "Calcul...";

  try {
    const r = await fetch(p.action.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: inputVal })
    });
    const json = await r.json();
    resField.innerText = "IA : " + (json.prediction || "Succès");
    resField.style.color = "green";
  } catch (e) {
    resField.innerText = "Erreur service.";
    resField.style.color = "red";
  }
}

document.addEventListener('DOMContentLoaded', chargerProjets);