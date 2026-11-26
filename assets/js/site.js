// Petites améliorations du site. Tout reste lisible et utilisable sans ce script.

// 1. En-tête : une fine bordure apparaît dès qu'on fait défiler la page.
const entete = document.querySelector("[data-entete]");
if (entete) {
  const majEntete = () => entete.classList.toggle("est-defile", window.scrollY > 8);
  majEntete();
  window.addEventListener("scroll", majEntete, { passive: true });
}

// 2. Menu sur téléphone : le refermer quand on choisit un lien.
const menuMobile = document.getElementById("menu-mobile");
if (menuMobile && typeof menuMobile.hidePopover === "function") {
  menuMobile.addEventListener("click", (evenement) => {
    if (evenement.target.closest("a")) menuMobile.hidePopover();
  });
}

// Fait défiler une barre de pilules horizontale pour montrer l'élément choisi,
// sans jamais faire bouger la page elle-même.
const centrerDansBarre = (element, barre) => {
  if (!barre || barre.scrollWidth <= barre.clientWidth) return;
  const cible = element.offsetLeft - (barre.clientWidth - element.offsetWidth) / 2;
  barre.scrollTo({ left: cible, behavior: "smooth" });
};

// 3. Apparition douce des blocs au défilement.
const blocs = document.querySelectorAll("[data-apparition]");
if ("IntersectionObserver" in window) {
  const observateur = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (entree.isIntersecting) {
          entree.target.classList.add("est-visible");
          observateur.unobserve(entree.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  blocs.forEach((bloc) => observateur.observe(bloc));
} else {
  blocs.forEach((bloc) => bloc.classList.add("est-visible"));
}

// 4. Onglets accessibles (visite du logiciel) : clic, flèches gauche/droite, Début/Fin.
document.querySelectorAll("[data-onglets]").forEach((zone) => {
  const onglets = [...zone.querySelectorAll('[role="tab"]')];
  const panneaux = onglets.map((onglet) => document.getElementById(onglet.getAttribute("aria-controls")));

  const activer = (index, focus = false) => {
    onglets.forEach((onglet, i) => {
      const actif = i === index;
      onglet.setAttribute("aria-selected", String(actif));
      onglet.tabIndex = actif ? 0 : -1;
      panneaux[i].hidden = !actif;
      panneaux[i].classList.toggle("est-actif", actif);
    });
    if (focus) onglets[index].focus({ preventScroll: true });
    centrerDansBarre(onglets[index], zone);
  };

  onglets.forEach((onglet, i) => {
    onglet.addEventListener("click", () => activer(i));
    onglet.addEventListener("keydown", (evenement) => {
      const dernier = onglets.length - 1;
      const cibles = { ArrowRight: i === dernier ? 0 : i + 1, ArrowLeft: i === 0 ? dernier : i - 1, Home: 0, End: dernier };
      if (evenement.key in cibles) {
        evenement.preventDefault();
        activer(cibles[evenement.key], true);
      }
    });
  });

  // Sans ce script, tous les panneaux restent affichés les uns sous les autres.
  zone.closest(".visite")?.classList.add("onglets-actifs");
  activer(0);
});

// 5. Sous-menu de la page Fonctionnalités : suit la section en cours de lecture.
const liensSousMenu = [...document.querySelectorAll("[data-sous-menu] a")];
if (liensSousMenu.length && "IntersectionObserver" in window) {
  const sections = liensSousMenu.map((lien) => document.querySelector(lien.getAttribute("href")));
  const suivi = new IntersectionObserver(
    (entrees) => {
      for (const entree of entrees) {
        if (!entree.isIntersecting) continue;
        const index = sections.indexOf(entree.target);
        liensSousMenu.forEach((lien, i) => lien.classList.toggle("est-actif", i === index));
        centrerDansBarre(liensSousMenu[index].parentElement, liensSousMenu[index].closest("ul"));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => section && suivi.observe(section));
}

// 6. Formulaire de démo : tant que l'envoi n'est pas branché, on le dit au lieu de faire semblant.
document.querySelectorAll("[data-formulaire-demo]").forEach((formulaire) => {
  formulaire.addEventListener("submit", (evenement) => {
    if (formulaire.dataset.envoiBranche === "oui") return;
    evenement.preventDefault();
    const message = formulaire.querySelector("[data-message-formulaire]");
    if (message) {
      message.hidden = false;
      message.focus();
    }
  });
});
