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
if (band) band.innerHTML = [...marken, ...marken].map(
  ([datei, name]) => `<span class="logo-feld"><img src="assets/marken/${datei}.png" alt="${name}" loading="lazy"></span>`
).join('');

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
const band2 = document.getElementById('zahlenband');
if (band2) {
  const auge = new IntersectionObserver(eintraege => {
    eintraege.forEach(e => {
      if (e.isIntersecting) {
        band2.querySelectorAll('.wert').forEach(zaehle);
        auge.disconnect();
      }
    });
  }, {threshold:.4});
  auge.observe(band2);
}

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
