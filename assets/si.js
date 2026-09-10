/* Kopfleiste legt sich beim Scrollen als Glasschicht über den Inhalt */
const kopf = document.getElementById('kopfleiste');
/* Seiten ohne Bühne tragen die Leiste dauerhaft hell, dort ruht der Wechsel */
if (kopf && kopf.classList.contains('fest') === false) {
const beobachteScroll = () => kopf.classList.toggle('glas', window.scrollY > 60);
beobachteScroll();
window.addEventListener('scroll', beobachteScroll, {passive:true});
}

/* Hamburger öffnet und schließt die Menüfläche */
const schalter = document.getElementById('menueSchalter');
const menue = document.getElementById('menue');
const menueSchalten = auf => {
  menue.classList.toggle('offen', auf);
  kopf.classList.toggle('hell', auf);
  schalter.classList.toggle('offen', auf);
  schalter.setAttribute('aria-expanded', auf ? 'true' : 'false');
  schalter.setAttribute('aria-label', auf ? 'Menü schließen' : 'Menü öffnen');
  document.body.style.overflow = auf ? 'hidden' : '';
};
schalter.addEventListener('click', () => menueSchalten(!menue.classList.contains('offen')));
menue.addEventListener('click', e => { if (e.target.closest('a')) menueSchalten(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') menueSchalten(false); });

/* Markenband: Logos zweimal ausgeben, damit der Lauf nahtlos schließt */
const marken = [
  ['sram','SRAM'],['rockshox','RockShox'],['zipp','Zipp'],['pirelli','Pirelli'],
  ['lezyne','Lezyne'],['wtb','WTB'],['hammerhead','Hammerhead'],['mahle','MAHLE'],
  ['ht-components','HT Components'],['redshift','Redshift'],['time','TIME'],
  ['reverse','Reverse'],['uswe','USWE'],['gripgrab','GripGrab'],['clif','CLIF'],
  ['odyssey','Odyssey'],['volume','Volume'],['bsd','BSD'],['fitbikeco','FitBikeCo'],
  ['sunday','Sunday'],['dynamic-bike-care','Dynamic Bike Care'],['ambit','Ambit'],
  ['cushcore','CushCore'],['odi','ODI'],['voxom','Voxom'],['7idp','7iDP']
];
const band = document.getElementById('laufband');
if (band) {
  band.innerHTML = [...marken, ...marken].map(
    ([datei, name]) => `<span class="logo-feld"><img src="assets/marken/${datei}.png" alt="${name}" loading="lazy"></span>`
  ).join('');

  /* Das Band zieht von selbst weiter und lässt sich zugleich mit den Pfeilen schieben.
     Die Logos stehen doppelt, deshalb springt der Lauf bei der Hälfte lautlos zurück. */
  const feld = band.closest('.markenband');
  const zurueck = feld && feld.querySelector('.zurueck');
  const vor = feld && feld.querySelector('.vor');
  let ruht = false, zuletzt = 0;

  const schiebe = richtung => {
    ruht = true;
    band.scrollBy({left: richtung * Math.round(band.clientWidth * .8), behavior:'smooth'});
    clearTimeout(schiebe.uhr);
    schiebe.uhr = setTimeout(() => { ruht = false; }, 2600);
  };
  if (zurueck) zurueck.addEventListener('click', () => schiebe(-1));
  if (vor) vor.addEventListener('click', () => schiebe(1));
  if (feld) {
    feld.addEventListener('pointerenter', () => { ruht = true; });
    feld.addEventListener('pointerleave', () => { ruht = false; });
  }

  const sanft = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const takt = jetzt => {
    const schritt = zuletzt ? (jetzt - zuletzt) / 1000 : 0;
    zuletzt = jetzt;
    if (!ruht && schritt < .2) {
      band.scrollLeft += 90 * schritt;
      const halb = band.scrollWidth / 2;
      if (band.scrollLeft >= halb) band.scrollLeft -= halb;
    }
    requestAnimationFrame(takt);
  };
  if (!sanft) requestAnimationFrame(takt);
}

/* Kennzahlen zählen von null auf ihren Wert, sobald sie ins Bild kommen */
const formatiere = n => n.toLocaleString('de-DE');
const zaehle = el => {
  const ziel = parseInt(el.dataset.ziel, 10);
  const ziffer = el.querySelector('.ziffer');
  const dauer = 1600, start = performance.now();
  const schritt = jetzt => {
    const t = Math.min((jetzt - start) / dauer, 1);
    const weich = 1 - Math.pow(1 - t, 3);
    ziffer.textContent = formatiere(Math.round(ziel * weich));
    if (t < 1) requestAnimationFrame(schritt);
  };
  requestAnimationFrame(schritt);
};
/* Jede Kennzahlenleiste zählt für sich, sobald sie ins Bild kommt.
   Zuvor lief allein die Leiste der Startseite über ihre Kennung. */
document.querySelectorAll('.zahlenband').forEach(band2 => {
  const auge = new IntersectionObserver(eintraege => {
    eintraege.forEach(e => {
      if (e.isIntersecting) {
        band2.querySelectorAll('.wert').forEach(zaehle);
        auge.disconnect();
      }
    });
  }, {threshold:.4});
  auge.observe(band2);
});

/* Die Markenkreise auf der Startseite blenden nacheinander ein, sobald sie ins Bild kommen */
const achse = document.querySelector('.achse');
if (achse) {
  achse.classList.add('animiert');
  const blick = new IntersectionObserver(eintraege => {
    eintraege.forEach(e => {
      if (e.isIntersecting) {
        achse.classList.add('sichtbar');
        blick.disconnect();
      }
    });
  }, {threshold:.25});
  blick.observe(achse);
}

/* Der mitfahrende Weg erscheint nach dem ersten Bildschirm und tritt ab,
   sobald der Abschluss mit demselben Angebot im Blick ist.
   Eine Seite kann mehrere Wege tragen, etwa die Markenübersicht mit ihren beiden
   Aufrufen. Jeder liest sein eigenes Ziel aus dem Verweis am Knopf. */
document.querySelectorAll('.mitfahrer').forEach(weg => {
  const ziel = (weg.getAttribute('href') || '').replace('#','');
  const abschluss = ziel ? document.getElementById(ziel) : null;
  /* Stehen mehrere Wege als Gruppe, treten sie gleich beim Aufruf der Seite auf.
     Ansage Tammo, 10.09.2026, für die Markenübersicht. Einzelne Wege warten
     weiterhin den ersten Bildschirm ab. */
  const sofort = weg.closest('.mitfahrer-gruppe') !== null;
  let abschlussImBlick = false;
  const pruefe = () => {
    const weitGenug = sofort || window.scrollY > window.innerHeight * .55;
    weg.classList.toggle('sichtbar', weitGenug && !abschlussImBlick);
  };
  if (abschluss) {
    new IntersectionObserver(eintraege => {
      eintraege.forEach(e => { abschlussImBlick = e.isIntersecting; pruefe(); });
    }, {threshold:.12}).observe(abschluss);
  }
  window.addEventListener('scroll', pruefe, {passive:true});
  window.addEventListener('resize', pruefe, {passive:true});
  pruefe();
});

/* ---------- Markenübersicht: es steht immer nur eine Marke offen ---------- */
/* Öffnet eine Zeile, schließen sich die übrigen. Das gilt über beide Gruppen und
   beide Spalten hinweg. Die roten Aufrufe am Seitenende bleiben davon frei, sie
   lassen sich unabhängig voneinander öffnen. Ansage Tammo, 10.09.2026. */
const markenZeilen = document.querySelectorAll('.marken-liste .marke:not(.marke-ruf)');
markenZeilen.forEach(zeile => {
  /* Der Griff am Klick statt am toggle-Ereignis: so schließen die übrigen Zeilen
     im selben Moment, in dem diese aufgeht. Die Tastatur löst denselben Weg aus. */
  zeile.querySelector('summary').addEventListener('click', () => {
    if (zeile.open) return;
    markenZeilen.forEach(andere => {
      if (andere !== zeile && andere.open) andere.open = false;
    });
  });
});

/* ---------- Zeitachse auf Über uns: blättern mit den Pfeilen ---------- */
const spur = document.getElementById('jahreSpur');
if (spur) {
  const halte = spur.querySelectorAll('.halt');
  const weite = () => {
    if (halte.length < 2) return spur.clientWidth;
    return halte[1].offsetLeft - halte[0].offsetLeft;
  };
  const bewege = richtung => spur.scrollBy({left: richtung * weite(), behavior: 'smooth'});
  const zurueck = document.querySelector('.jahre .zurueck');
  const vor = document.querySelector('.jahre .vor');
  if (zurueck) zurueck.addEventListener('click', () => bewege(-1));
  if (vor) vor.addEventListener('click', () => bewege(1));

  /* Am jeweiligen Ende ruht der Pfeil */
  const stand = () => {
    const rest = spur.scrollWidth - spur.clientWidth - spur.scrollLeft;
    if (zurueck) zurueck.style.opacity = spur.scrollLeft > 4 ? '1' : '.35';
    if (vor) vor.style.opacity = rest > 4 ? '1' : '.35';
  };
  spur.addEventListener('scroll', stand);
  window.addEventListener('resize', stand);

  /* Die Achse steht beim Laden am jüngsten Jahr, von dort blättert man zurück */
  const ansJuengste = () => {
    const vorher = spur.style.scrollBehavior;
    spur.style.scrollBehavior = 'auto';
    spur.scrollLeft = spur.scrollWidth;
    spur.style.scrollBehavior = vorher;
    stand();
  };
  ansJuengste();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ansJuengste);
  window.addEventListener('load', ansJuengste, {once:true});
}

/* ---------- Karriere: offene Stellen auf- und zuklappen ---------- */
/* Ein Klick auf die Kopfzeile öffnet die Stelle, ein zweiter schließt sie wieder.
   Die Kopfzeile ist ein Button, damit Tastatur und Vorlesegeräte sie sicher erreichen. */
document.querySelectorAll('.stelle .kopf').forEach(kopfzeile => {
  kopfzeile.addEventListener('click', () => {
    const stelle = kopfzeile.closest('.stelle');
    const auf = stelle.classList.toggle('offen');
    kopfzeile.setAttribute('aria-expanded', auf ? 'true' : 'false');
  });
});
