/* eslint-disable */
// BLACKBOX Cosmétique — whiteboard de proposition features (style Milanote/Excalidraw,
// moteur design-canvas.jsx de Vlad réutilisé tel quel). Deux vues : Tech / Simple.
// DS KHube : accent bleu royal #3A66D8 (jamais purple), base neutre shadcn, system font.

const { useState } = React;
const { DCViewport } = window;

// ─── DS D-Studio tokens (dstudio-ui) — mode CLAIR (pas de noir dominant, demande Kevin) ───
// Accent de marque = rouge #ef4444. Palette charts du DS pour les autres accents.
// Gris zinc D-Studio. Police Aeonik (brand font). Fond clair lisible.
const BRAND = '#ef4444';                     // rouge de marque D-Studio (color.red)
const SKY   = 'hsl(197, 37%, 24%)';          // chart.3 — bleu profond
const GREEN = 'hsl(173, 58%, 39%)';          // chart.2 — teal
const AMBER = 'hsl(43, 74%, 56%)';           // chart.4 — ambre (un peu assombri pour le contraste)
const TERRA = 'hsl(12, 76%, 55%)';           // chart.1 — terracotta
const ROYAL = BRAND;                         // l'accent principal = la marque
const RED   = BRAND, INK = '#27272a', VIOLET = 'hsl(12, 76%, 55%)';
const FG = '#18181b', MUT = '#71717a', LINE = '#e4e4e7', CARD = '#ffffff', BG = '#fafafa';
const FONT = '"Aeonik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ─── Icônes SVG line monochrome (remplacent les emojis — cohérent, pro, charté) ───
function Icon({ name, color = FG, size = 20 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    cube:    <><path d="M21 7.5l-9-5-9 5 9 5 9-5z"/><path d="M3 7.5v9l9 5 9-5v-9"/><path d="M12 12.5v9"/></>,
    mirror:  <><rect x="6" y="2" width="12" height="20" rx="6"/><path d="M9 7h6"/></>,
    rocket:  <><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M12 2c3 1 6 4 7 9-2 2-5 4-9 5-1-4 1-9 2-14z"/><circle cx="14.5" cy="9.5" r="1.5"/></>,
    bolt:    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
    link:    <><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5"/></>,
    search:  <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    flag:    <><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></>,
    refresh: <><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/></>,
    chart:   <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 5-6"/></>,
    globe:   <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/></>,
    rotate3d:<><path d="M12 3a9 9 0 109 9"/><path d="M12 3v6l4-2"/><path d="M16 16l3 3-3 3"/></>,
    sparkle: <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"/></>,
    target:  <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    layers:  <><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></>,
    shield:  <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></>,
    one:     <text x="12" y="16" fontSize="13" fontWeight="700" fill={color} stroke="none" textAnchor="middle" fontFamily="Aeonik, sans-serif">1</text>,
    two:     <text x="12" y="16" fontSize="13" fontWeight="700" fill={color} stroke="none" textAnchor="middle" fontFamily="Aeonik, sans-serif">2</text>,
    three:   <text x="12" y="16" fontSize="13" fontWeight="700" fill={color} stroke="none" textAnchor="middle" fontFamily="Aeonik, sans-serif">3</text>,
  };
  return <svg {...p}>{paths[name] || paths.cube}</svg>;
}

// ─── Tag V1/V2/skip/stat (couleurs tokens D-Studio) ───
function Tag({ kind, children }) {
  const map = {
    v1:   { bg: 'hsla(173,58%,39%,.14)', fg: 'hsl(173,58%,32%)' },   // teal = livraison
    v2:   { bg: 'hsla(43,74%,50%,.18)',  fg: 'hsl(35,80%,38%)' },    // ambre = phase 2
    skip: { bg: 'rgba(239,68,68,.13)',   fg: '#c4392e' },            // rouge marque = éviter
    stat: { bg: 'rgba(39,39,42,.07)',    fg: '#3f3f46' },            // zinc = chiffre
  };
  const c = map[kind] || map.stat;
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.02em', padding: '3px 7px',
    borderRadius: 5, background: c.bg, color: c.fg, whiteSpace: 'nowrap' }}>{children}</span>;
}

// ─── Carte-nœud whiteboard. icon = NOM d'icône SVG (jamais emoji). h = hauteur fixe (cohérence rangée). ───
function Card({ x, y, w, h, accent = ROYAL, title, icon, body, tags, big, wide }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box',
      background: CARD, border: `1px solid ${LINE}`, borderTop: `3px solid ${accent}`,
      borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 3px rgba(24,24,27,.06)', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {icon
          ? <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, display: 'grid',
              placeItems: 'center', background: `${accent}1a` }}><Icon name={icon} color={accent} size={16} /></span>
          : <span style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flex: 'none' }} />}
        <span style={{ fontSize: wide ? 15 : 13.5, fontWeight: 700, letterSpacing: '-.01em', color: FG }}>{title}</span>
      </div>
      {big && <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1, color: accent }}>{big}</div>}
      {body && <div style={{ fontSize: 12.5, lineHeight: 1.5, color: MUT }}>{body}</div>}
      {tags && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto', paddingTop: 4 }}>
        {tags.map(([k, t], i) => <Tag key={i} kind={k}>{t}</Tag>)}</div>}
    </div>
  );
}

// ─── Étiquette de zone (gros titre flottant sur le canevas) ───
function Zone({ x, y, num, title, sub, color = ROYAL }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: FONT, width: 360 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: color, color: '#fff',
          fontSize: 14, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{num}</span>
        <span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.03em', color: FG }}>{title}</span>
      </div>
      {sub && <div style={{ fontSize: 12.5, color: MUT, marginTop: 6, marginLeft: 41 }}>{sub}</div>}
    </div>
  );
}

// ─── Connecteur SVG (sous les cartes) ───
function Wire({ d, color = '#c9cdd6', dash = '5 4' }) {
  return <path d={d} stroke={color} strokeWidth="1.6" fill="none" strokeDasharray={dash}
    markerEnd="url(#bb-ah)" />;
}

// ══════════════════ VUE TECHNIQUE ══════════════════
function TechBoard() {
  return (
    <div style={{ position: 'relative', width: 2240, height: 1240 }}>
      <svg width="2240" height="1240" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <marker id="bb-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c9cdd6" />
          </marker>
        </defs>
        {/* A (stack) → C (la stack alimente la signature) */}
        <Wire d="M 830 200 C 880 200, 880 200, 916 200" />
        {/* C interconnexion → SEO (le fix = l'interconnexion) */}
        <Wire d="M 1484 610 C 1560 610, 1560 470, 1636 470" color={ROYAL} />
      </svg>

      {/* ZONE A — stack standard */}
      <Zone x={40} y={36} num="A" title="Stack DTC standard" sub="On couvre tout l'écosystème Shopify 2026 · répond à la Q stack d'Ayoub" />
      <Card x={40}  y={130} w={250} h={150} accent={ROYAL} title="Email / SMS" body={<><b style={{color:FG}}>Klaviyo</b> — leader natif Shopify, flows abandon / win-back. Alt : Attentive, Postscript.</>} tags={[['v1','V1']]} />
      <Card x={310} y={130} w={250} h={150} accent={ROYAL} title="Reviews / UGC" body={<><b style={{color:FG}}>Judge.me</b> (couverture) ou <b style={{color:FG}}>Loox</b> (visuel avant/après). Alt : Okendo.</>} tags={[['v1','V1']]} />
      <Card x={580} y={130} w={250} h={150} accent={ROYAL} title="Upsell / bundles" body={<><b style={{color:FG}}>Rebuy</b> — IA, upsell post-achat = +panier sur pic viral.</>} tags={[['v1','V1']]} />
      <Card x={40}  y={300} w={250} h={150} accent={ROYAL} title="Fidélité / parrainage" body={<><b style={{color:FG}}>Smile.io</b> — referral = levier viral. Alt : LoyaltyLion.</>} tags={[['v1','V1']]} />
      <Card x={310} y={300} w={250} h={150} accent={SKY}   title="Abonnements" icon="refresh" body={<><b style={{color:FG}}>Recharge</b> — routines cheveux = récurrence. Convertit le viral en LTV.</>} tags={[['v1','V1 light'],['v2','V2 full']]} />
      <Card x={580} y={300} w={250} h={150} accent={ROYAL} title="Analytics / attribution" body={<><b style={{color:FG}}>Triple Whale</b> — ROI d'un pic. Alt : Northbeam (>100k$/mois).</>} tags={[['v1','V1']]} />
      <Card x={40}  y={470} w={250} h={150} accent={ROYAL} title="Landing campagnes" body={<><b style={{color:FG}}>Replo</b> — A/B testing, landing virales (Ayoub : « landing campagnes »).</>} tags={[['v1','V1']]} />
      <Card x={310} y={470} w={250} h={150} accent={AMBER} title="Search & discovery" body={<><b style={{color:FG}}>Algolia</b> — ingredients / AI search. V1 = Shopify natif suffit.</>} tags={[['v2','V2']]} />
      <Card x={580} y={470} w={250} h={150} accent={AMBER} title="Retours / échanges" body={<><b style={{color:FG}}>Loop Returns</b> — échanges convertissent 35-55%, natif Klaviyo.</>} tags={[['v2','V2']]} />
      <Card x={40}  y={620} w={520} accent={GREEN} title="Reco D-Studio — phaser, pas tout brancher au lancement" wide body="V1 = Klaviyo + Judge.me/Loox + Rebuy + Smile.io + Triple Whale + Replo. Chaque app = coût mensuel + complexité → on active le reste selon la traction." />

      {/* ZONE C — signature (colonne milieu, y36→870, séparée de A par x) */}
      <Zone x={920} y={36} num="C" title="Signature D-Studio" sub="Le concret, pas que du design · chiffres marché 2026" color={GREEN} />
      <Card x={920}  y={130} w={270} h={158} accent={GREEN} title="Packshot 3D interactif" icon="rotate3d" body={<>Rotation/zoom/lumière → on VOIT la texture. <b style={{color:FG}}>Lazy-load au click, jamais au page-load</b> (sinon crash pic/4G).</>} tags={[['v1','V1 · TOP'],['stat','+94% conv'],['stat','-52% retours']]} />
      <Card x={1210} y={130} w={270} h={158} accent={AMBER} title="AR try-on cheveux" icon="mirror" body={<>Voir le rendu sur soi. Engine custom 80-150k€. <b style={{color:FG}}>V1 = Snapchat Lens</b> (gratuit, viral) → V2 AR web.</>} tags={[['v1','V1 Lens'],['v2','V2 web'],['stat','+35% panier']]} />
      <Card x={920}  y={360} w={270} h={158} accent={GREEN} title="Hero scroll premium" icon="sparkle" body={<>CSS parallax + GSAP = +23% scroll, +40% session, mobile-safe. Pas de WebGL scroll mobile.</>} tags={[['v1','V1'],['skip','pas WebGL mobile']]} />
      <Card x={1210} y={360} w={270} h={158} accent={GREEN} title="Micro-interactions" icon="sparkle" body="Hover lift, CTA expand, add-to-cart pulse. ~3-5j, CSS GPU = perf nulle. Sert la DA minimaliste." tags={[['v1','V1 · quasi gratuit']]} />
      <Card x={920}  y={560} w={560} accent={ROYAL} title="Interconnexion des sites du groupe" wide icon="link"
        body={<>Compte unifié (<b style={{color:FG}}>Customer Account API</b>, natif 2026 — pas Multipass) + fidélité partagée (<b style={{color:FG}}>Smile.io</b> multi-store) + wishlist cross-site (GoWish). Si marques cohérentes → <b style={{color:FG}}>Shopify Markets</b> (1 store) = clients/checkout/loyalty unifiés, moins cher que N stores. Panier cross-site = mauvaise UX, on évite.</>}
        tags={[['v1','V1/V2'],['stat','notre savoir-faire écosystème']]} />

      {/* ZONE B — reco CTO (SOUS la zone C, y780→1100 : plus aucune collision) */}
      <Zone x={920} y={780} num="B" title="Reco CTO — votre cas" sub="Là où l'arbitrage technique compte vraiment" color={INK} />
      <Card x={920}  y={874} w={270} h={158} accent={INK} title="Abonnements = pari récurrence" body="Cheveux texturés = entretien régulier. « Subscribe & Save » transforme un pic TikTok one-shot en revenu récurrent (LTV)." />
      <Card x={1210} y={874} w={270} h={158} accent={RED} title="Perf = la vraie exigence cachée" icon="bolt" body={<>« Encaisser les pics » = <b style={{color:FG}}>architecture</b>, pas features. Budget 80% ops / 20% front : CDN edge, lazy-load total, LCP &lt; 2,5s.</>} tags={[['stat','lazy = survit 50×']]} />
      <Card x={920}  y={1054} w={270} h={158} accent={INK} title="France + US = phaser" body={<>Sales Tax/TVA, CCPA/RGPD, 3PL distincts. <b style={{color:FG}}>Shopify Markets</b> gère par pays sans rebuild. FR d'abord, US phase 2.</>} />
      <Card x={1210} y={1054} w={270} h={158} accent={INK} title="Reviews / CRO avant gros budget pub" body="Un tunnel qui convertit avant de scaler la pub : preuve sociale + A/B testing landing. Sinon on paie du trafic qui rebondit." />

      {/* ZONE SEO/GEO (colonne droite, rapprochée x1640) */}
      <Zone x={1640} y={36} num="?" title="SEO / GEO multi-site" sub="« Google aime de moins en moins le multi-site de groupe ? » — la réponse factuelle" color={AMBER} />
      <Card x={1640} y={150} w={250} h={150} accent={RED}   title="Pas une pénalité compute" icon="shield" body="Le crawl budget n'est un sujet qu'au-delà de ~50-100k URLs → non-problème ici. Google ne déclasse pas « parce que ça coûte à crawler »." />
      <Card x={1910} y={150} w={250} h={150} accent={AMBER} title="Handicap RÉEL" big="−25→40%" body={<>De trafic vs domaine unique. Cause : <b style={{color:FG}}>dilution d'autorité</b> (backlinks répartis) + <b style={{color:FG}}>cannibalisation</b> de mots-clés.</>} />
      <Card x={1640} y={400} w={250} h={150} accent={ROYAL} title="GEO encore pire" big="GEO" body={<>Fragmenté → l'IA cite <b style={{color:FG}}>Sephora à votre place</b>. Consolidé + schema Organization → entité citable.</>} />
      <Card x={1910} y={400} w={250} h={150} accent={GREEN} title="Le fix = l'interconnexion (C)" body="schema.org Organization (sameAs tous domaines) + cross-linking + sitemap consolidé + hreflang testé GSC + canonicals stricts. Un écosystème cohérent ne se cannibalise pas." tags={[['stat','= argument C']]} />
    </div>
  );
}

// ══════════════════ VUE SIMPLE ══════════════════
// Grille régulière : 2 colonnes de CARD_W, gouttière GUT. Cartes de HAUTEUR FIXE (H_BEN)
// par rangée → toutes cohérentes. Icône SVG (jamais d'emoji).
const CARD_W = 416, GUT = 28, COL2 = CARD_W + GUT;          // largeur carte + 2e colonne
const H_BEN = 150;                                          // hauteur fixe carte bénéfice
function Benefit({ x, y, w = CARD_W, icon, title, body, accent = ROYAL }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: H_BEN, boxSizing: 'border-box',
      background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18,
      display: 'flex', gap: 14, boxShadow: '0 1px 3px rgba(24,24,27,.06)', fontFamily: FONT }}>
      <div style={{ width: 40, height: 40, flex: 'none', borderRadius: 10,
        display: 'grid', placeItems: 'center', background: `${accent}1a` }}><Icon name={icon} color={accent} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', color: FG, lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.45, color: MUT, marginTop: 6 }}>{body}</div>
      </div>
    </div>
  );
}
function Chiffre({ x, y, w, big, body, accent = ROYAL }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box',
      background: '#fff', border: `1px solid ${LINE}`, borderLeft: `3px solid ${accent}`,
      borderRadius: '0 12px 12px 0', padding: '14px 18px', fontFamily: FONT,
      boxShadow: '0 1px 3px rgba(24,24,27,.05)' }}>
      <span style={{ fontSize: 13, color: MUT, lineHeight: 1.5 }}><b style={{ color: accent, fontSize: 15 }}>{big}</b> {body}</span>
    </div>
  );
}
function SimpleBoard() {
  // Colonnes : gauche x=40, droite x=40+COL2*2+80 (bloc de 2 colonnes + marge)
  const L = 40, R = 40 + COL2 * 2 + 80;         // origine bloc gauche / droite
  const W2 = CARD_W * 2 + GUT;                   // largeur d'une rangée pleine (chiffre)
  return (
    <div style={{ position: 'relative', width: R + W2 + 40, height: 980 }}>
      {/* ─ Promesse 1 (haut-gauche) ─ */}
      <Zone x={L} y={36} num="1" title="Voir le produit, pas une photo" sub="La texture qui vend — en 3D et en essayage virtuel" />
      <Benefit x={L}       y={130} icon="rotate3d" accent={GREEN} title="Le produit tourne, on voit la matière" body="Le client fait pivoter le flacon, zoome sur la crème, la voit attraper la lumière. Une texture qui bouge vend mieux qu'une photo figée." />
      <Benefit x={L+COL2}  y={130} icon="mirror"   accent={AMBER} title="« Sur moi, ça donne quoi ? »" body="L'essayage en réalité augmentée laisse voir le rendu sur ses propres cheveux. L'outil qui rassure le plus avant d'acheter — et qui se partage tout seul." />
      <Chiffre x={L} y={130+H_BEN+18} w={W2} accent={GREEN} big="+94 %" body="de ventes en plus avec la 3D / l'essayage, et un tiers de retours en moins (les gens savent ce qu'ils commandent)." />

      {/* ─ Promesse 2 (bas-gauche) ─ */}
      <Zone x={L} y={420} num="2" title="Le site tient quand ça devient viral" sub="Un drop influenceur ne doit jamais faire tomber la boutique" color={INK} />
      <Benefit x={L}       y={514} icon="rocket" accent={BRAND} title="Prêt pour le coup de projecteur" body="Quand une célébrité parle de vous, des milliers de personnes arrivent en quelques minutes. Le site absorbe ça sans ralentir ni planter — c'est là que l'argent se gagne." />
      <Benefit x={L+COL2}  y={514} icon="bolt"   accent={SKY}   title="Rapide partout, même en 4G" body="Chaque seconde de chargement en trop fait fuir des clients. On construit léger : les belles images et la 3D ne chargent que quand il faut." />
      <Chiffre x={L} y={514+H_BEN+18} w={W2} accent={BRAND} big="50×" body="le trafic normal encaissé par un site bien construit ; un site trop lourd cale dès 3×. On met l'effort sur la solidité avant le gadget." />

      {/* ─ Promesse 3 (haut-droite) ─ */}
      <Zone x={R} y={36} num="3" title="Vos marques travaillent ensemble" sub="Un seul écosystème, pas des sites qui s'ignorent" color={ROYAL} />
      <Benefit x={R}       y={130} icon="link"   accent={ROYAL} title="Un compte, des points partout" body="Le client se connecte une fois et retrouve compte, points de fidélité et favoris sur toutes vos boutiques. Plus il reste dans l'univers BLACKBOX, plus il revient." />
      <Benefit x={R+COL2}  y={130} icon="search" accent={SKY}   title="Mieux vu sur Google et par les IA" body="Des sites éparpillés se concurrencent et se diluent. Reliés proprement, ils additionnent leur force — mieux référencés, plus souvent cités par des moteurs comme ChatGPT." />
      <Chiffre x={R} y={130+H_BEN+18} w={W2} accent={ROYAL} big="+25 à 40 %" body="de trafic pour une présence regroupée et reliée, vs un éparpillement de sites isolés — à effort égal." />

      {/* ─ Comment on avance (bas-droite) : 2 cartes + 1 pleine largeur pour rester cohérent ─ */}
      <Zone x={R} y={420} num="→" title="Comment on avance" sub="On livre par étapes, on prouve, on amplifie" color={GREEN} />
      <Benefit x={R}       y={514} icon="one" accent={GREEN} title="V1 — le lancement" body="La boutique, la 3D produit, la base marketing — prête pour le viral dès le jour 1." />
      <Benefit x={R+COL2}  y={514} icon="two" accent={AMBER} title="V2 — l'amplification" body="Essayage augmenté, abonnements, optimisation — activés quand le volume le justifie." />
      <Chiffre x={R} y={514+H_BEN+18} w={W2} accent={ROYAL} big="FR → US" body=": on lance la France, puis on active les États-Unis sans tout refaire (config par pays, pas un nouveau site)." />
    </div>
  );
}

// ══════════════════ APP ══════════════════
function App() {
  const [mode, setMode] = useState('tech');
  const [dark, setDark] = useState(false);
  const bg = dark ? '#0a0a0a' : BG;

  const Seg = ({ id, label }) => (
    <button onClick={() => setMode(id)} style={{
      border: 0, background: mode === id ? '#fff' : 'transparent', color: mode === id ? FG : MUT,
      fontFamily: FONT, fontWeight: 600, fontSize: 13, padding: '7px 16px', borderRadius: 999,
      cursor: 'pointer', boxShadow: mode === id ? '0 1px 3px rgba(10,10,10,.12)' : 'none' }}>{label}</button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: bg, fontFamily: FONT }}>
      {/* top bar flottante */}
      <div style={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: `1px solid ${LINE}`,
          borderRadius: 12, padding: '8px 14px', boxShadow: '0 2px 12px rgba(24,24,27,.08)', pointerEvents: 'auto' }}>
          {/* Logo D-Studio (path réel dstudio-logo.svg) — noir, couleur d'origine de la marque */}
          <svg width="22" height="27" viewBox="0 0 411 499" fill="none" style={{ flex: 'none' }}>
            <path d="M381.542 346.524C393.347 334.992 402.881 321.327 409.585 306.202C405.972 332.521 398.599 358.205 387.761 382.428C372.082 418.294 345.939 448.508 312.719 469.024C276.855 489.803 235.964 500.136 194.588 498.901H118.764C123.345 486.958 125.654 474.228 125.505 461.424C126.175 435.404 116.008 410.32 97.4617 392.162C78.7291 373.704 53.3302 363.746 27.1492 364.494C17.9878 364.42 8.86354 365.505 0 367.677V0.0993196H194.551C235.666 -1.09873 276.408 8.56056 312.645 28.0664C345.604 47.048 371.859 75.951 387.687 110.695C400.088 137.726 407.946 166.629 411 196.205C404.259 179.695 394.204 164.794 381.505 152.364C355.249 126.494 319.683 112.529 282.926 113.652C246.168 112.529 210.565 126.531 184.347 152.402C158.352 177.86 144.126 213.053 145.057 249.519C144.088 285.985 158.352 321.177 184.347 346.598C210.565 372.506 246.168 386.509 282.926 385.423C319.683 386.509 355.249 372.506 381.505 346.598" fill="#0a0a0a"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '-.01em', color: FG }}>BLACKBOX Cosmétique</div>
            <div style={{ fontSize: 10.5, color: MUT }}>Proposition e-commerce · D-Studio · whiteboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <div style={{ display: 'inline-flex', background: '#f5f5f5', border: `1px solid ${LINE}`,
            borderRadius: 999, padding: 3, boxShadow: '0 2px 12px rgba(10,10,10,.08)' }}>
            <Seg id="tech" label="Technique" /><Seg id="simple" label="Simple" />
          </div>
        </div>
      </div>

      {/* hint pan/zoom */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 100, background: '#fff',
        border: `1px solid ${LINE}`, borderRadius: 9, padding: '7px 12px', fontSize: 11.5, color: MUT,
        boxShadow: '0 2px 12px rgba(10,10,10,.08)' }}>
        Glisser pour déplacer · molette / pinch pour zoomer · glisser une carte pour la ranger
      </div>

      <DCViewport minScale={0.2} maxScale={2.5} style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'relative', padding: 80 }}>
          {mode === 'tech' ? <TechBoard /> : <SimpleBoard />}
        </div>
      </DCViewport>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
