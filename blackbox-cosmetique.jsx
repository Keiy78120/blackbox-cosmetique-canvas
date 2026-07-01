/* eslint-disable */
// BLACKBOX Cosmétique — whiteboard de proposition features (style Milanote/Excalidraw,
// moteur design-canvas.jsx de Vlad réutilisé tel quel). Deux vues : Tech / Simple.
// DS KHube : accent bleu royal #3A66D8 (jamais purple), base neutre shadcn, system font.

const { useState, useRef } = React;
const { DCViewport } = window;

// ─── DnD simple : hook qui rend une carte absolue déplaçable à la souris. ───
// Compense le zoom du viewport (--dc-inv-zoom posé par DCViewport) → drag 1:1.
// stopPropagation au pointerdown → le pan du viewport ne se déclenche pas pendant le drag d'une carte.
function useDrag() {
  const ref = useRef(null);
  const drag = useRef(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const invZoom = () => {
    const world = document.querySelector('[style*="--dc-inv-zoom"]');
    const v = world && getComputedStyle(world).getPropertyValue('--dc-inv-zoom');
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };
  const handlers = {
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      drag.current = { sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y, k: invZoom() };
      ref.current?.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e) => {
      if (!drag.current) return;
      const { sx, sy, ox, oy, k } = drag.current;
      setOff({ x: ox + (e.clientX - sx) * k, y: oy + (e.clientY - sy) * k });
    },
    onPointerUp: (e) => { drag.current = null; ref.current?.releasePointerCapture?.(e.pointerId); },
    onPointerCancel: () => { drag.current = null; },
  };
  return { ref, off, handlers, dragging: !!drag.current };
}

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
    server:  <><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></>,
    brain:   <><path d="M9 3a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 003 3V3z"/><path d="M15 3a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-3 3V3z"/><path d="M12 3v18"/></>,
    unlock:  <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.9-1"/></>,
    plug:    <><path d="M12 2v6M9 8h6v3a3 3 0 01-6 0V8z"/><path d="M12 14v8"/></>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
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

// ─── Carte-nœud whiteboard. icon = nom d'icône SVG (jamais emoji).
//     lead = 1 phrase courte (l'outil + l'essentiel). bullets = puces brèves (formatage humain).
//     PAS de hauteur fixe : la carte s'ajuste au contenu COURT (textes simplifiés). ───
function Card({ x, y, w, accent = ROYAL, title, icon, lead, bullets, body, tags, big, wide }) {
  const { ref, off, handlers, dragging } = useDrag();
  return (
    <div ref={ref} {...handlers} data-dc-slot style={{ position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box',
      transform: `translate(${off.x}px, ${off.y}px)`, zIndex: dragging ? 60 : (off.x || off.y ? 20 : 'auto'),
      cursor: 'grab', touchAction: 'none',
      background: CARD, border: `1px solid ${LINE}`, borderTop: `3px solid ${accent}`,
      borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9,
      boxShadow: dragging ? '0 12px 32px rgba(24,24,27,.18)' : '0 1px 3px rgba(24,24,27,.06)', fontFamily: FONT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {icon
          ? <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, display: 'grid',
              placeItems: 'center', background: `${accent}1a` }}><Icon name={icon} color={accent} size={16} /></span>
          : <span style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flex: 'none' }} />}
        <span style={{ fontSize: wide ? 15 : 13.5, fontWeight: 700, letterSpacing: '-.01em', color: FG }}>{title}</span>
      </div>
      {big && <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1, color: accent }}>{big}</div>}
      {lead && <div style={{ fontSize: 12.5, lineHeight: 1.45, color: FG, fontWeight: 500 }}>{lead}</div>}
      {bullets && <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flex: 'none', marginTop: 6 }} />
            <span style={{ fontSize: 12, lineHeight: 1.4, color: MUT }}>{b}</span>
          </div>
        ))}
      </div>}
      {body && <div style={{ fontSize: 12.5, lineHeight: 1.5, color: MUT }}>{body}</div>}
      {tags && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 2 }}>
        {tags.map(([k, t], i) => <Tag key={i} kind={k}>{t}</Tag>)}</div>}
    </div>
  );
}

// ─── SYSTÈME D'ESPACEMENT (hiérarchie spatiale cohérente) ───
// Rythme vertical constant : le header de zone occupe une hauteur FIXE (titre même sur 2 lignes
// + sous-titre + respiration) avant que les cartes commencent. Plus d'air ENTRE zones qu'À L'INTÉRIEUR.
const ZONE_HEAD = 104;   // hauteur réservée au titre+sous-titre d'une zone avant la 1re carte
const ROW = 196;         // pas vertical entre rangées de cartes d'une même zone
const ZGAP = 72;         // respiration supplémentaire entre la fin d'une zone et la suivante

// ─── Étiquette de zone — header à hauteur réservée (le titre peut wrapper sans coller les cartes) ───
function Zone({ x, y, w = 420, num, title, sub, color = ROYAL }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: FONT, width: w, height: ZONE_HEAD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 8, background: color, color: '#fff',
          fontSize: 14, fontWeight: 800, display: 'grid', placeItems: 'center' }}>{num}</span>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', color: FG, lineHeight: 1.1 }}>{title}</span>
      </div>
      {sub && <div style={{ fontSize: 12.5, color: MUT, marginTop: 8, marginLeft: 41 }}>{sub}</div>}
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
  // Rythme cohérent : chaque zone a une origine Y ; ses cartes commencent à origY+ZONE_HEAD,
  // rangées espacées de ROW. Colonnes : A x40 · C/B x920 · SEO x1640.
  const Z_TOP = 40;                          // origine Y commune des zones du haut (A, C, SEO)
  const row0 = Z_TOP + ZONE_HEAD;            // 1re rangée de carte sous un header de zone à Z_TOP
  const RY = (n) => row0 + n * ROW;          // rangée n d'une zone démarrant à Z_TOP
  // Zone B : sous la zone C. C a 3 rangées (0,1,2) → fin ≈ RY(2)+hauteur carte wide. On laisse ZGAP.
  const B_TOP = RY(2) + 230 + ZGAP;          // origine de la zone B (sous la carte Interconnexion de C)
  const Bcard = (n) => B_TOP + ZONE_HEAD + n * ROW;
  // Zone SEO quick-wins : sous le diagnostic (2 rangées).
  const QW_TOP = RY(1) + ROW + ZGAP;         // origine de la sous-zone quick-wins
  const QWcard = (n) => QW_TOP + ZONE_HEAD + n * ROW;
  return (
    <div style={{ position: 'relative', width: 2260, height: 1620 }}>
      <svg width="2260" height="1620" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <marker id="bb-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c9cdd6" />
          </marker>
        </defs>
      </svg>

      {/* ── ZONE A — stack standard (3 colonnes × 3 rangées) ── */}
      <Zone x={40} y={36} num="A" title="Stack DTC standard" sub="On couvre tout l'écosystème Shopify · la stack tech est déjà standard" />
      <Card x={40}  y={RY(0)} w={250} accent={ROYAL} title="Email / SMS"      lead="Klaviyo" bullets={['Leader, natif Shopify', 'Flows abandon · win-back']} tags={[['v1','V1']]} />
      <Card x={310} y={RY(0)} w={250} accent={ROYAL} title="Reviews / UGC"    lead="Judge.me ou Loox" bullets={['Loox = visuel avant/après', 'Idéal cosmétique']} tags={[['v1','V1']]} />
      <Card x={580} y={RY(0)} w={250} accent={ROYAL} title="Upsell / bundles" lead="Rebuy" bullets={['Upsell IA post-achat', '+ panier sur un pic']} tags={[['v1','V1']]} />
      <Card x={40}  y={RY(1)} w={250} accent={ROYAL} title="Fidélité"         lead="Smile.io" bullets={['Parrainage = levier viral', 'Alt : LoyaltyLion']} tags={[['v1','V1']]} />
      <Card x={310} y={RY(1)} w={250} accent={SKY}   title="Abonnements" icon="refresh" lead="Recharge" bullets={['Routines cheveux = récurrence', 'Le viral devient de la LTV']} tags={[['v1','V1'],['v2','V2 full']]} />
      <Card x={580} y={RY(1)} w={250} accent={ROYAL} title="Analytics"        lead="Triple Whale" bullets={['Mesure le ROI d’un pic', 'Alt : Northbeam']} tags={[['v1','V1']]} />
      <Card x={40}  y={RY(2)} w={250} accent={ROYAL} title="Landing campagnes" lead="Replo" bullets={['A/B testing', 'Landing virales']} tags={[['v1','V1']]} />
      <Card x={310} y={RY(2)} w={250} accent={AMBER} title="Search"           lead="Algolia" bullets={['Recherche IA · ingredients', 'V1 : natif Shopify suffit']} tags={[['v2','V2']]} />
      <Card x={580} y={RY(2)} w={250} accent={AMBER} title="Retours"          lead="Loop Returns" bullets={['Échanges convertissent 35-55%', 'Natif Klaviyo']} tags={[['v2','V2']]} />
      <Card x={40}  y={RY(3)} w={790} accent={GREEN} wide title="Reco — phaser, pas tout brancher au lancement"
        bullets={['V1 : Klaviyo + Judge.me/Loox + Rebuy + Smile.io + Triple Whale + Replo', 'Chaque app = un coût mensuel → on active le reste selon la traction']} />

      {/* ── ZONE C — signature (colonne milieu) ── */}
      <Zone x={920} y={36} num="C" title="Signature D-Studio" sub="Le concret qui nous différencie · chiffres marché 2026" color={GREEN} />
      <Card x={920}  y={RY(0)} w={270} accent={GREEN} title="Packshot 3D interactif" icon="rotate3d" lead="On voit la texture du produit." bullets={['Rotation · zoom · lumière', 'Lazy-load au click (jamais au load)']} tags={[['v1','V1 · TOP'],['stat','+94% conv']]} />
      <Card x={1210} y={RY(0)} w={270} accent={AMBER} title="Zoom macro texture" icon="search" lead="Le fini réel, de près." bullets={['Crème, gel, poudre — le vrai rendu', 'Swatch nuancier au survol']} tags={[['v1','V1'],['stat','-⅓ retours']]} />
      <Card x={920}  y={RY(1)} w={270} accent={GREEN} title="Hero scroll premium" icon="sparkle" lead="Parallax CSS + GSAP." bullets={['+23% scroll · +40% session', 'Mobile-safe (pas de WebGL mobile)']} tags={[['v1','V1']]} />
      <Card x={1210} y={RY(1)} w={270} accent={GREEN} title="Micro-interactions" icon="sparkle" lead="Le détail premium." bullets={['Hover, CTA, add-to-cart', '~3-5j · perf nulle (CSS GPU)']} tags={[['v1','V1 · quasi gratuit']]} />
      <Card x={920}  y={RY(2)} w={560} accent={ROYAL} wide icon="link" title="Interconnexion des sites du groupe"
        lead="Un seul écosystème, pas des sites isolés." bullets={['Compte unifié (Customer Account API, natif 2026)', 'Fidélité partagée (Smile.io) + wishlist cross-site', 'Marques cohérentes → Shopify Markets (1 store, moins cher)']} tags={[['v1','V1/V2'],['stat','notre savoir-faire']]} />

      {/* ── ZONE B — reco CTO (sous C, avec ZGAP de respiration) ── */}
      <Zone x={920} y={B_TOP} num="B" title="Reco CTO — votre cas" sub="Là où l'arbitrage technique compte vraiment" color={INK} />
      <Card x={920}  y={Bcard(0)} w={270} accent={INK} title="Abonnements = pari récurrence" lead="Cheveux texturés = entretien régulier." bullets={['« Subscribe & Save »', 'Le pic one-shot devient récurrent']} />
      <Card x={1210} y={Bcard(0)} w={270} accent={RED} icon="bolt" title="Perf = l'exigence cachée" lead="Encaisser les pics = archi, pas features." bullets={['80% ops / 20% front', 'CDN edge · lazy-load · LCP < 2,5s']} tags={[['stat','lazy = survit 50×']]} />
      <Card x={920}  y={Bcard(1)} w={270} accent={INK} title="France + US = phaser" lead="Shopify Markets gère par pays." bullets={['TVA/Sales Tax · RGPD/CCPA · 3PL', 'FR d’abord, US en phase 2']} />
      <Card x={1210} y={Bcard(1)} w={270} accent={INK} title="Reviews avant gros budget pub" lead="Un tunnel qui convertit d'abord." bullets={['Preuve sociale + A/B testing', 'Sinon on paie du trafic qui rebondit']} />

      {/* ── ZONE SEO/GEO — diagnostic (colonne droite) ── */}
      <Zone x={1640} y={36} num="?" title="SEO / GEO multi-site" sub="« Google aime de moins le multi-site de groupe ? » — le diagnostic" color={AMBER} />
      <Card x={1640} y={RY(0)} w={250} accent={RED}   title="Pas une pénalité compute" icon="shield" lead="Le crawl budget = non-sujet ici." bullets={['Pertinent qu’au-delà de ~50-100k URLs', 'Google ne « facture » pas le crawl']} />
      <Card x={1910} y={RY(0)} w={250} accent={AMBER} title="Handicap réel" big="−25→40%" bullets={['De trafic vs domaine unique', 'Dilution d’autorité + cannibalisation']} />
      <Card x={1640} y={RY(1)} w={250} accent={ROYAL} title="GEO encore pire" big="GEO" bullets={['Fragmenté → l’IA cite Sephora', 'Consolidé → vous devenez citable']} />
      <Card x={1910} y={RY(1)} w={250} accent={GREEN} title="Le fix = l'interconnexion" lead="Un écosystème relié ne se cannibalise pas." bullets={['= l’argument C']} tags={[['stat','= argument C']]} />

      {/* ── ZONE SEO/GEO — quick wins concrets (deep-research 2026), sous le diagnostic + ZGAP ── */}
      <Zone x={1640} y={QW_TOP} num="✓" title="Quick wins GEO — 2026" sub="Pour être cité par Google ET les IA (ChatGPT, Perplexity)" color={GREEN} />
      <Card x={1640} y={QWcard(0)} w={250} accent={ROYAL} icon="globe"  title="Entité de marque" lead="Wikidata + schema sameAs." bullets={['La source que tous les LLM lisent', 'Gratuit · ~2h']} tags={[['v1','V1 · quick win']]} />
      <Card x={1910} y={QWcard(0)} w={250} accent={GREEN} icon="search" title="FAQ schema = citable" lead="67% de taux de citation IA." bullets={['Contenu extractible en <100 mots', 'Affirmation + source + chiffre']} tags={[['v1','V1'],['stat','67%']]} />
      <Card x={1640} y={QWcard(1)} w={250} accent={SKY}   icon="layers" title="Autorité + Reddit" lead="Hub « cheveux texturés »." bullets={['Pillar + clusters = 2,8× plus cité', 'Reddit r/curlyhair + YouTube']} tags={[['v2','V2 · contenu']]} />
      <Card x={1910} y={QWcard(1)} w={250} accent={AMBER} icon="flag"   title="Multi-pays propre" lead="hreflang FR / US / AR." bullets={['Sous-dossiers > domaines séparés', 'Tester en GSC · llms.txt racine']} tags={[['v1','V1'],['v2','V2']]} />
      <Card x={1640} y={QWcard(2)} w={520} accent={ROYAL} wide icon="chart" title="Mesurable + vendable" lead="On mesure les citations IA (Profound / PEEC)." bullets={['Benchmark vs Sephora/concurrents', 'GEO-first = positionnement rare en France']} />
    </div>
  );
}

// ══════════════════ VUE SIMPLE ══════════════════
// Grille régulière : 2 colonnes de CARD_W, gouttière GUT. Cartes de HAUTEUR FIXE (H_BEN)
// par rangée → toutes cohérentes. Icône SVG (jamais d'emoji).
const CARD_W = 416, GUT = 28, COL2 = CARD_W + GUT;          // largeur carte + 2e colonne
const H_BEN = 150;                                          // hauteur fixe carte bénéfice
function Benefit({ x, y, w = CARD_W, icon, title, body, accent = ROYAL }) {
  const { ref, off, handlers, dragging } = useDrag();
  return (
    <div ref={ref} {...handlers} data-dc-slot style={{ position: 'absolute', left: x, top: y, width: w, height: H_BEN, boxSizing: 'border-box',
      transform: `translate(${off.x}px, ${off.y}px)`, zIndex: dragging ? 60 : (off.x || off.y ? 20 : 'auto'),
      cursor: 'grab', touchAction: 'none',
      background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18,
      display: 'flex', gap: 14, boxShadow: dragging ? '0 12px 32px rgba(24,24,27,.18)' : '0 1px 3px rgba(24,24,27,.06)', fontFamily: FONT }}>
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
      <Zone x={L} y={36} num="1" title="Voir le produit, pas une photo" sub="La texture qui vend — en 3D et en macro" />
      <Benefit x={L}       y={130} icon="rotate3d" accent={GREEN} title="Le produit tourne, on voit la matière" body="Le client fait pivoter le flacon, zoome sur la crème, la voit attraper la lumière. Une texture qui bouge vend mieux qu'une photo figée." />
      <Benefit x={L+COL2}  y={130} icon="search"   accent={AMBER} title="« C'est quoi, cette texture ? »" body="Un zoom macro montre le fini réel — crème fondante, gel frais, poudre soyeuse. On voit exactement ce qu'on achète : ce qui rassure le plus avant de commander." />
      <Chiffre x={L} y={130+H_BEN+18} w={W2} accent={GREEN} big="+94 %" body="de ventes en plus avec la 3D produit, et un tiers de retours en moins (les gens savent ce qu'ils commandent)." />

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
      <Benefit x={R+COL2}  y={514} icon="two" accent={AMBER} title="V2 — l'amplification" body="Diagnostic peau, abonnements, optimisation — activés quand le volume le justifie." />
      <Chiffre x={R} y={514+H_BEN+18} w={W2} accent={ROYAL} big="FR → US" body=": on lance la France, puis on active les États-Unis sans tout refaire (config par pays, pas un nouveau site)." />
    </div>
  );
}

// ══════════════════ VUE PLATEFORME D-STUDIO ══════════════════
// Couche OPTIONNELLE par-dessus le Shopify (qui reste 100% portable — anti-lock-in).
// White-label STRICT : on ne nomme JAMAIS les outils internes (vkode/khube) — c'est « la
// plateforme D-Studio ». Cadrage : option, jamais obligation. Rétention par la valeur, pas le piège.
function SovereignBoard() {
  const Z_TOP = 140;                          // origine Y des zones du haut (aligne header ↔ cartes)
  const row0 = Z_TOP + ZONE_HEAD;
  const RY = (n) => row0 + n * ROW;
  // 3e zone (déblocage), sous les 2 premières colonnes — réutilise le rythme ZGAP.
  const C_TOP = RY(1) + ROW + ZGAP;
  const Ccard = (n) => C_TOP + ZONE_HEAD + n * ROW;
  return (
    <div style={{ position: 'relative', width: 2000, height: 1320 }}>
      {/* ── Bandeau de réassurance (le 1er message : on ne vous enferme pas) ── */}
      <div style={{ position: 'absolute', left: 40, top: 24, width: 1380, boxSizing: 'border-box',
        background: '#fff', border: `1px solid ${LINE}`, borderLeft: `4px solid ${GREEN}`, borderRadius: 12,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT,
        boxShadow: '0 1px 3px rgba(24,24,27,.06)' }}>
        <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 9, display: 'grid',
          placeItems: 'center', background: `${GREEN}1a` }}><Icon name="unlock" color={GREEN} size={22} /></span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', color: FG }}>Votre Shopify reste 100% à vous — ceci est une option, pas une dépendance</div>
          <div style={{ fontSize: 12.5, color: MUT, marginTop: 4, lineHeight: 1.45 }}>La boutique, le thème et vos données restent portables et autonomes. La couche D-Studio s'ajoute par-dessus si vous la voulez, et se retire sans casser le site.</div>
        </div>
      </div>

      {/* ── ZONE 1 — Back-office privé self-host ── */}
      <Zone x={40} y={140} num="1" title="Votre back-office privé" sub="Hébergé chez vous, sous votre contrôle — la donnée ne quitte pas votre maison" color={SKY} />
      <Card x={40}  y={RY(0)} w={270} accent={SKY} icon="server" title="Plateforme D-Studio self-host"
        lead="Un back-office unique au-dessus de Shopify." bullets={['Hébergé sur vos serveurs (chez vous)', 'Catalogue, clients, commandes : une seule vue']} tags={[['v1','Option'],['stat','sur-mesure']]} />
      <Card x={330} y={RY(0)} w={270} accent={SKY} icon="shield" title="Donnée privée"
        lead="Vos data restent chez vous, pas chez un éditeur." bullets={['RGPD natif · pas de revente data', 'Aucun tiers ne lit vos clients']} tags={[['v1','Option']]} />
      <Card x={40}  y={RY(1)} w={560} accent={SKY} wide icon="plug" title="Branché sur l'existant, sans remplacer"
        lead="La couche se connecte à Shopify et aux apps — elle ne les remplace pas." bullets={['Webhooks + API Shopify (rien de propriétaire imposé)', 'Vous gardez Klaviyo, vos reviews, votre stack', 'On débranche la couche → le Shopify continue de tourner']} />

      {/* ── ZONE 2 — IA centralisée à mémoire commune ── */}
      <Zone x={920} y={140} num="2" title="IA centralisée à mémoire commune" sub="Une seule intelligence qui connaît tout votre écosystème — pas 5 outils qui s'ignorent" color={BRAND} />
      <Card x={920}  y={RY(0)} w={270} accent={BRAND} icon="brain" title="Mémoire partagée entre vos marques"
        lead="L'IA se souvient d'un client sur TOUTES vos boutiques." bullets={['Cosmétique + Capsule + Store = un seul cerveau', 'Profil, historique, préférences unifiés']} tags={[['v1','Option · moat']]} />
      <Card x={1210} y={RY(0)} w={270} accent={BRAND} icon="sparkle" title="Assistant produit + support"
        lead="Recommande et répond avec le contexte réel du client." bullets={['« Pour tes locks, prends X + Y »', 'Support 24/7 nourri par votre catalogue']} tags={[['v1','Option']]} />
      <Card x={920}  y={RY(1)} w={560} accent={BRAND} wide icon="eye" title="Pilotage : une IA qui voit tout, vous décidez"
        lead="Tableau de bord IA centralisé sur l'ensemble du groupe." bullets={['Détecte les tendances cross-marques (un pic viral qui démarre)', 'Propose · vous validez — jamais d\'action automatique non contrôlée', 'La mémoire commune est l\'actif qui grandit avec vous (= rétention par la valeur)']} />

      {/* ── ZONE 3 — Ce que ça débloque / pourquoi c'est nous ── */}
      <Zone x={40} y={C_TOP} num="→" title="Pourquoi c'est notre domaine" sub="Le savoir-faire phygital BLACKBOX — ce qu'un studio Shopify lambda ne peut pas apporter" color={GREEN} />
      <Card x={40}  y={Ccard(0)} w={270} accent={GREEN} icon="link" title="Le pont salon ↔ retrait colis"
        lead="On maîtrise la logique salon — votre cœur de métier phygital." bullets={['Click & collect dans le bon BlackBox', 'Notre domaine, pas une découverte']} tags={[['stat','savoir-faire']]} />
      <Card x={330} y={Ccard(0)} w={270} accent={GREEN} icon="refresh" title="Évolutif à votre rythme"
        lead="On active la couche par briques, quand vous voulez." bullets={['Commencez Shopify seul', 'Ajoutez la couche D-Studio plus tard']} tags={[['v1','V1 → V2']]} />
      <Card x={620} y={Ccard(0)} w={270} accent={INK} icon="unlock" title="Réversible par design"
        lead="Aucun verrou : vous partez quand vous voulez." bullets={['Export complet de vos données', 'Le Shopify survit sans nous']} tags={[['stat','anti lock-in']]} />
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
            <Seg id="tech" label="Technique" /><Seg id="simple" label="Simple" /><Seg id="sovereign" label="Plateforme D-Studio" />
          </div>
        </div>
      </div>

      {/* hint pan/zoom */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 100, background: '#fff',
        border: `1px solid ${LINE}`, borderRadius: 9, padding: '7px 12px', fontSize: 11.5, color: MUT,
        boxShadow: '0 2px 12px rgba(10,10,10,.08)' }}>
        Glisser le fond = déplacer · molette / pinch = zoomer · glisser une CARTE = la ranger
      </div>

      <DCViewport minScale={0.2} maxScale={2.5} style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'relative', padding: 80 }}>
          {mode === 'tech' ? <TechBoard /> : mode === 'simple' ? <SimpleBoard /> : <SovereignBoard />}
        </div>
      </DCViewport>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
