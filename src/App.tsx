import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import TreeStage from "./TreeStage";

type PageId = "home" | "about" | "projects" | "experience" | "skills" | "achievements" | "contact";
type IconName = "home" | "about" | "projects" | "experience" | "skills" | "achievements" | "contact";

const pages: { id: PageId; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "about", label: "About", icon: "about" },
  { id: "projects", label: "Projects", icon: "projects" },
  { id: "experience", label: "Experience", icon: "experience" },
  { id: "skills", label: "Skills", icon: "skills" },
  { id: "achievements", label: "Achievements", icon: "achievements" },
  { id: "contact", label: "Contact", icon: "contact" },
];

const sceneImages: Record<PageId, string> = {
  home: "/images/home.jpg",
  about: "/images/about.jpg",
  projects: "/images/projects.jpg",
  experience: "/images/experience-plate.jpg",
  skills: "/images/skills-tree.jpg",
  achievements: "/images/achievements.jpg",
  contact: "/images/contact.jpg",
};

function getPageFromHash(): PageId {
  const id = window.location.hash.replace("#", "") as PageId;
  return pages.some((page) => page.id === id) ? id : "home";
}

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 28" aria-hidden="true" fill="none">
      <path
        d="M15 25.2 3.8 14.3C-3 7.4 6.1-.2 12.2 5.7L15 8.4l2.8-2.7c6.1-5.9 15.2 1.7 8.4 8.6L15 25.2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 26 18" aria-hidden="true" fill="none">
      <path d="M2 9h20M15 2l7 7-7 7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChickMascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={`chick-mascot${small ? " chick-mascot--small" : ""}`}
      viewBox="0 0 120 120"
      role="img"
      aria-label="A cheerful yellow chick mascot"
    >
      <ellipse cx="60" cy="104" rx="38" ry="6" fill="#a45b2d" opacity=".17" />
      <path d="M28 82c-8-9-9-22-5-34 5-15 19-25 37-27 23-3 42 10 47 29 5 18-1 34-13 43-8 6-19 8-35 8-14 0-25-6-31-19Z" fill="#ffd957" stroke="#4d2d1a" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M48 23c-2-8 2-14 6-15 1 6 4 8 7 10 2-5 6-8 10-8 1 7-1 11-5 15" fill="#ffd957" stroke="#4d2d1a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 73c-8-3-12-1-15 4 5 1 7 4 9 8 4 1 8-1 11-5M96 77c8-4 13-2 16 3-5 2-7 5-8 9-5 1-9-1-12-5" fill="#ffdf68" stroke="#4d2d1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="43" cy="60" rx="5.2" ry="7" fill="#24180f" />
      <ellipse cx="78" cy="60" rx="5.2" ry="7" fill="#24180f" />
      <circle cx="44.5" cy="57.7" r="1.5" fill="#fff8e3" />
      <circle cx="79.5" cy="57.7" r="1.5" fill="#fff8e3" />
      <ellipse cx="31" cy="74" rx="7" ry="4.2" fill="#f78d77" opacity=".9" />
      <ellipse cx="90" cy="74" rx="7" ry="4.2" fill="#f78d77" opacity=".9" />
      <path d="m53 68 8-4 9 5-8 7-9-3Z" fill="#ed8a22" stroke="#4d2d1a" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M48 98c-3 4-3 8 0 10 4 1 7-2 8-6M73 98c1 4 4 7 8 6 3-2 2-6-1-9" fill="none" stroke="#bd651b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M41 35c6-4 13-6 20-6" fill="none" stroke="#fff0a4" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

function NavIcon({ name }: { name: IconName }) {
  const common = {
    stroke: "#342519",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const art: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3.5 10 8.5-7 8.5 7" fill="#f29a51" {...common} />
        <path d="M5.8 9.2V21h12.4V9.2" fill="#f2c15d" {...common} />
        <path d="M9.1 21v-7h5.8v7" fill="#fff2cf" {...common} />
        <path d="M17.5 5.4h2v4" {...common} />
      </>
    ),
    about: (
      <>
        <path d="M3.2 5.8c3.5-1.9 7-1.8 8.8.2v14c-2.3-1.9-5.6-2-8.8-.3Z" fill="#fff4db" {...common} />
        <path d="M20.8 5.8c-3.5-1.9-7-1.8-8.8.2v14c2.3-1.9 5.6-2 8.8-.3Z" fill="#f5e4bf" {...common} />
        <path d="M5.5 9h3.7M5.5 12h3.7M15 9h3.5M15 12h3.5" {...common} />
      </>
    ),
    projects: (
      <>
        <path d="m3 5.3 5.4-2.1 7.2 2.1L21 3v15.5l-5.4 2.3-7.2-2.2L3 20.7Z" fill="#74b8d2" {...common} />
        <path d="M8.4 3.2v15.4M15.6 5.3v15.5" {...common} />
        <path d="m5 9 1.2 1.2L5 11.4M10.2 14l1.2 1.2-1.2 1.2" {...common} style={{ stroke: "#f9dc7e" }} />
      </>
    ),
    experience: (
      <>
        <path d="M3 8.2h13.4l3.3 3.1v6H3Z" fill="#e96f4d" {...common} />
        <path d="M16.3 8.2V4.7h-5v3.5" fill="#edb95e" {...common} />
        <path d="M5 10.3h3.2v3H5zM10 10.3h3.2v3H10z" fill="#b8d7df" {...common} />
        <circle cx="7" cy="18" r="2" fill="#493224" {...common} />
        <circle cx="17" cy="18" r="2" fill="#493224" {...common} />
        <path d="M18.5 5.2c1.4-1.3 1.9-2.2 1.4-3.2" {...common} />
      </>
    ),
    skills: (
      <>
        <path d="M11.5 20.5v-7.4" {...common} style={{ strokeWidth: 2.6 }} />
        <path d="M11.5 14c-6.2.1-8.2-3.3-7.1-6.9 4.1-.3 6.8 1.3 7.1 6.9ZM11.7 11.6c-.1-5.5 3.1-8.3 7.1-7.7.8 4.6-1.1 7.5-7.1 7.7Z" fill="#69a75d" {...common} />
        <path d="M7.2 21h8.6" {...common} />
      </>
    ),
    achievements: (
      <>
        <path d="M7 4.3h10v5.9a5 5 0 0 1-10 0Z" fill="#f6bf40" {...common} />
        <path d="M7 6H3.7v2.4c0 2.4 1.4 3.8 4.2 4M17 6h3.3v2.4c0 2.4-1.4 3.8-4.2 4M12 15v4M8.5 21h7" {...common} />
      </>
    ),
    contact: (
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.2" fill="#ef7665" {...common} />
        <path d="m4.4 6.5 7.6 6.1 7.6-6.1" stroke="#fff3d8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none">{art[name]}</svg>;
}

function ChickBrand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className={`brand-lockup${compact ? " brand-lockup--compact" : ""}`} aria-label="Vishesh's Little World, home">
      <ChickMascot small={compact} />
      <span className="brand-name">Vishesh's<br />Little World</span>
      {!compact && <HeartIcon className="brand-heart" />}
    </a>
  );
}

function NavigationLinks({ active, onNavigate }: { active: PageId; onNavigate?: () => void }) {
  return (
    <>
      {pages.map((page) => (
        <a
          key={page.id}
          href={`#${page.id}`}
          className={`nav-link${active === page.id ? " is-active" : ""}`}
          aria-current={active === page.id ? "page" : undefined}
          onClick={onNavigate}
        >
          <NavIcon name={page.icon} />
          <span>{page.label}</span>
        </a>
      ))}
    </>
  );
}

function Sidebar({ active }: { active: PageId }) {
  return (
    <aside className="sidebar">
      <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
      <ChickBrand />
      <nav className="side-navigation" aria-label="Main navigation">
        <NavigationLinks active={active} />
      </nav>
      <div className="side-footer">
        <span className="footer-sprig" aria-hidden="true"><i /><i /><i /></span>
        <p>Keep curious.<br />Keep creating.</p>
        <a href="#contact">Say hello <ArrowIcon /></a>
      </div>
    </aside>
  );
}

function MobileHeader({ active, open, onToggle, onNavigate }: { active: PageId; open: boolean; onToggle: () => void; onNavigate: () => void }) {
  return (
    <>
      <header className="mobile-header">
        <ChickBrand compact />
        <button className={`menu-toggle${open ? " is-open" : ""}`} type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={onToggle}>
          <span className="menu-lines" aria-hidden="true"><i /><i /><i /></span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </header>
      {open && (
        <nav className="mobile-navigation" id="mobile-navigation" aria-label="Main navigation">
          <NavigationLinks active={active} onNavigate={onNavigate} />
        </nav>
      )}
    </>
  );
}

function HangingSign({ title, subtitle, className = "", id }: { title: string; subtitle: string; className?: string; id?: string }) {
  return (
    <div className={`hanging-sign ${className}`}>
      <span className="sign-rope sign-rope--left" aria-hidden="true" />
      <span className="sign-rope sign-rope--right" aria-hidden="true" />
      <div className="sign-face">
        <h1 id={id}>{title}<HeartIcon className="sign-heart" /></h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <section className="page home-page" aria-labelledby="home-title">
      <div className="home-copy">
        <h1 id="home-title"><span>Hi, I'm</span><strong>Vishesh<HeartIcon className="home-heart" /></strong></h1>
        <p className="home-tagline">I build things, break things,<br />and occasionally make them cute.</p>
        <div className="home-actions">
          <a className="storybook-button storybook-button--gold" href="#about">Explore My World <ArrowIcon /></a>
          <a className="storybook-button" href="#projects">See My Work</a>
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  const roles = [
    { label: "Developer", icon: "screen", color: "lavender" },
    { label: "Designer", icon: "palette", color: "peach" },
    { label: "Problem Solver", icon: "bulb", color: "gold" },
    { label: "Curious Human", icon: "sprout", color: "sage" },
  ];

  return (
    <section className="page about-page" aria-labelledby="about-title">
      <div className="about-spread">
        <div className="about-intro">
          <h1 id="about-title">About Me <HeartIcon /></h1>
          <p className="about-lede">A curious mind who loves turning ideas into meaningful things.</p>
        </div>
        <div className="about-roles" aria-label="A few things that describe me">
          {roles.map((role) => (
            <div className={`role-ribbon role-ribbon--${role.color}`} key={role.label}>
              <RoleIcon name={role.icon} />
              <span>{role.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    screen: <><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 1.4-3.9 1.6 1.6 0 0 1 1-2.8H18a3 3 0 0 0 3-3c0-4.6-4-8.3-9-8.3Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="15" cy="8" r="1" /></>,
    bulb: <><path d="M8 14.5a6 6 0 1 1 8 0c-1 .8-1.4 1.8-1.5 3h-5c-.1-1.2-.5-2.2-1.5-3Z" /><path d="M9.5 20h5M10 17.5h4M12 1v2M4.5 4.5 6 6M19.5 4.5 18 6" /></>,
    sprout: <><path d="M12 21v-9M12 14C6 14 4 11 5 7c4-.5 7 2 7 7ZM12 11c0-5 3-7 7-6 1 4-1 7-7 8" /><path d="M8 21h8" /></>,
  };

  return <svg className="role-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

type Project = {
  title: string;
  subtitle: string;
  icon: "laptop" | "brain" | "database" | "game";
  position: string;
  detail: string;
};

const projects: Project[] = [
  { title: "AI Resume Analyzer", subtitle: "Smart resume insights", icon: "laptop", position: "resume", detail: "A resume-focused project designed to turn a first look into clearer, more useful career insights." },
  { title: "Deepfake Detection", subtitle: "Detect. Analyse. Prevent.", icon: "brain", position: "deepfake", detail: "An exploration of tools and techniques for identifying manipulated images and video." },
  { title: "Punarchakra", subtitle: "Waste to resources", icon: "database", position: "punarchakra", detail: "A sustainability-minded idea centered on finding a second life for everyday waste." },
  { title: "Mini Games", subtitle: "Small ideas, big fun", icon: "game", position: "games", detail: "A playful collection of small experiments made to be explored and enjoyed." },
];

function ProjectIcon({ type }: { type: Project["icon"] }) {
  const paths: Record<Project["icon"], React.ReactNode> = {
    laptop: <><rect x="4" y="4" width="16" height="12" rx="1.2" /><path d="M2.5 20h19M9 16l-1 4M15 16l1 4" /></>,
    brain: <><path d="M12 5a3.2 3.2 0 0 0-5.8 1.8A3.6 3.6 0 0 0 4 13.5 3.3 3.3 0 0 0 7 19h5ZM12 5a3.2 3.2 0 0 1 5.8 1.8A3.6 3.6 0 0 1 20 13.5 3.3 3.3 0 0 1 17 19h-5ZM8 9h2m4 0h2m-8 5h2m4 0h2M12 5v14" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    game: <><path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.4a2 2 0 0 1-3.1 1l-2.1-1.5h-5l-2.1 1.5a2 2 0 0 1-3.1-1l-1.1-3.4A4 4 0 0 1 7 8Z" /><path d="M8 11v4M6 13h4M16.5 12h.1M18 14h.1" /></>,
  };

  return <svg className="project-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

function ProjectsPage({ onSelect }: { onSelect: (project: Project) => void }) {
  return (
    <section className="page projects-page" aria-labelledby="projects-title">
      <p className="landscape-note">Different problems,<br />same curiosity.</p>
      <HangingSign id="projects-title" title="My Projects" subtitle="Ideas / Experiments / Little Solutions" className="projects-sign" />
      <div className="project-map" aria-label="Selected projects">
        {projects.map((project) => (
          <button className={`project-marker project-marker--${project.position}`} key={project.title} type="button" onClick={() => onSelect(project)} aria-label={`Open ${project.title} project details`}>
            <span className="marker-icon"><ProjectIcon type={project.icon} /></span>
            <span className="marker-copy"><strong>{project.title}</strong><small>{project.subtitle}</small></span>
            <ArrowIcon className="marker-arrow" />
          </button>
        ))}
        <a className="map-signpost" href="#contact">More ideas<br />on the way <ArrowIcon /></a>
      </div>
    </section>
  );
}

const experiences = [
  { company: "IIT Mandi", date: "Jun 2026 - Jul 2026", description: "Worked on a full-stack mobility platform.", tags: ["Full-stack", "NDA"] },
  { company: "Zeta Algorithms", date: "Jul 2026 (15 days)", description: "Worked on CI/CD pipelines and automated deployment for scalable systems.", tags: ["AWS", "Docker", "CI/CD"] },
  { company: "A2IT Online", date: "Jun 2025 - Aug 2025", description: "Built a smart assistant bot using LLM + RAG to answer queries and automate tasks.", tags: ["Python", "LLMs", "RAG"] },
  { company: "Unified Mentor", date: "Mar 2025 - Jun 2025", description: "Built a churn predictor and restaurant growth analysis using ML and data analysis.", tags: ["ML", "Data Analysis", "Python"] },
];

function ExperienceDetailIcon({ index }: { index: number }) {
  const icons: React.ReactNode[] = [
    <><rect x="4" y="4" width="16" height="12" rx="1.2" /><path d="M2.5 20h19M9 16l-1 4M15 16l1 4" /></>,
    <><path d="M12 5a3.2 3.2 0 0 0-5.8 1.8A3.6 3.6 0 0 0 4 13.5 3.3 3.3 0 0 0 7 19h5ZM12 5a3.2 3.2 0 0 1 5.8 1.8A3.6 3.6 0 0 1 20 13.5 3.3 3.3 0 0 1 17 19h-5ZM8 9h2m4 0h2m-8 5h2m4 0h2M12 5v14" /></>,
    <><rect x="4" y="4" width="16" height="7" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M7 7.5h.1M7 17h.1M11 7.5h6M11 17h6" /></>,
    <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 20v-1.3a5.5 5.5 0 0 1 11 0V20ZM15.2 15a4.4 4.4 0 0 1 5.3 4.3v.7h-4" /></>,
  ];
  return <svg className="experience-detail-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[index % icons.length]}</svg>;
}

type FlipStage = "mini" | "expanding" | "expanded" | "collapsing";

// Geometry of the painted train inside the 1376x768 scene artwork. The locomotive + four
// carriages live in /images/train-sprite.webp; the empty landscape is /images/experience-plate.jpg.
const TRAIN_SPRITE = { w: 2002, h: 388 };
const TRAIN_GAP = 0.1; // empty track between one train copy and the next, as a fraction of train length
const TRAIN_SPEED = 0.042; // train lengths per second at cruising speed
// x-range (in sprite pixels) of the blank paper panel on each carriage, and their shared y-range
const CAR_PANELS: ReadonlyArray<readonly [number, number]> = [[609, 860], [963, 1211], [1328, 1582], [1686, 1938]];
const CAR_PANEL_Y = [117, 269] as const;
// spinning wheels: [centre x, centre y, radius] in sprite pixels (artwork cut out into /images/train-wheels.webp)
const WHEEL_TILE = 116;
const WHEELS: ReadonlyArray<readonly [number, number, number]> = [[142,345.1,32.5],[218,346.5,30.5],[296,315.4,60.3],[444,314.9,60.1],[655,339.7,38.6],[812,339.7,38.8],[1004,339.8,38.7],[1167,339.7,38.7],[1371,339.8,38.5],[1530,339.8,38.6],[1743,339.7,38.7],[1900,339.6,38.7]];
// connecting rods stay still on top of the spinning drivers: [x, y, w, h]
const ROD_BOX = [242, 297, 196, 47] as const;

const panelStyle = (index: number): React.CSSProperties => {
  const [x0, x1] = CAR_PANELS[index];
  return {
    left: `${(x0 / TRAIN_SPRITE.w) * 100}%`,
    width: `${((x1 - x0) / TRAIN_SPRITE.w) * 100}%`,
    top: `${(CAR_PANEL_Y[0] / TRAIN_SPRITE.h) * 100}%`,
    height: `${((CAR_PANEL_Y[1] - CAR_PANEL_Y[0]) / TRAIN_SPRITE.h) * 100}%`,
  };
};

function ExperiencePage() {
  const runRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLButtonElement | null>(null);
  const startRectRef = useRef<DOMRect | null>(null);

  const wheelEls = useRef<HTMLElement[]>([]);
  const speedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const offsetRef = useRef(0);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [flip, setFlip] = useState<{ index: number; key: string; stage: FlipStage } | null>(null);

  // The whole train (locomotive + four carriages + their paper cards) is ONE element,
  // so the spacing between cars can never change. A second copy sits one train-length
  // (plus a gap) behind it (the train drives right to left); sliding both by the same offset and wrapping at that period
  // gives the endless exit-right / enter-left loop without any visible reset.
  useEffect(() => {
    targetSpeedRef.current = hoveredKey !== null || flip !== null ? 0 : 1;
  }, [hoveredKey, flip]);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    wheelEls.current = Array.from(document.querySelectorAll<HTMLElement>(".train-wheel"));
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const run = runRef.current;
      const sprite = spriteRef.current;
      if (run && sprite) {
        const length = sprite.offsetWidth;
        const target = reduceMotion ? 0 : targetSpeedRef.current;
        // brake fairly quickly, pull away slowly - like a heavy train
        const tau = target === 0 ? 0.3 : 0.85;
        speedRef.current += (target - speedRef.current) * (1 - Math.exp(-dt / tau));
        if (target === 0 && speedRef.current < 0.002) speedRef.current = 0;
        const period = length * (1 + TRAIN_GAP);
        offsetRef.current = (offsetRef.current + length * TRAIN_SPEED * speedRef.current * dt) % period;
        const scale = length / TRAIN_SPRITE.w;
        const phase = (offsetRef.current / length) * 150;
        const lively = Math.min(1, speedRef.current * 1.4);
        const bob = (Math.sin(phase) * 0.9 + Math.sin(phase * 0.37 + 1) * 0.7) * scale * lively;
        const tilt = Math.sin(phase * 0.8) * 0.05 * lively;
        // wheels roll without slipping: angle = distance travelled / radius (train drives right to left)
        const travelled = offsetRef.current / scale;
        const wheels = wheelEls.current;
        for (let i = 0; i < wheels.length; i += 1) {
          const radius = Number(wheels[i].dataset.r) || 40;
          wheels[i].style.transform = `rotate(${(-(travelled / radius) * 57.2958).toFixed(2)}deg)`;
        }
        run.style.transform = `translate3d(${(-offsetRef.current).toFixed(2)}px, ${bob.toFixed(2)}px, 0) rotate(${tilt.toFixed(3)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const placeFlipAt = (box: HTMLDivElement, rect: DOMRect, withTransition: boolean) => {
    const target = box.getBoundingClientRect();
    const scaleX = rect.width / target.width;
    const scaleY = rect.height / target.height;
    const dx = rect.left + rect.width / 2 - (target.left + target.width / 2);
    const dy = rect.top + rect.height / 2 - (target.top + target.height / 2);
    box.style.transition = withTransition ? "" : "none";
    box.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
  };

  useLayoutEffect(() => {
    if (!flip || flip.stage !== "mini" || !flipRef.current || !startRectRef.current) return;
    const box = flipRef.current;
    placeFlipAt(box, startRectRef.current, false);
    void box.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        box.style.transition = "";
        box.style.transform = "translate3d(0,0,0) scale(1,1)";
        setFlip((current) => (current && current.stage === "mini" ? { ...current, stage: "expanding" } : current));
      });
    });
  }, [flip]);

  const openCard = (index: number, key: string, el: HTMLButtonElement) => {
    if (flip) return;
    // the train stops dead the moment a card is picked up, so the paper lifts off a stationary carriage
    speedRef.current = 0;
    targetSpeedRef.current = 0;
    sourceRef.current = el;
    startRectRef.current = el.getBoundingClientRect();
    setFlip({ index, key, stage: "mini" });
  };

  const closeCard = () => {
    setFlip((current) => {
      if (!current || current.stage === "collapsing") return current;
      if (current.stage === "mini") return null;
      const el = sourceRef.current;
      const box = flipRef.current;
      if (el && box) placeFlipAt(box, el.getBoundingClientRect(), true);
      return { ...current, stage: "collapsing" };
    });
  };

  const handleFlipTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    setFlip((current) => {
      if (!current) return current;
      if (current.stage === "expanding") return { ...current, stage: "expanded" };
      if (current.stage === "collapsing") {
        setHoveredKey(null);
        return null;
      }
      return current;
    });
  };

  useEffect(() => {
    if (!flip) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCard();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flip]);

  const active = flip ? experiences[flip.index] : null;
  const scrimVisible = !!flip && flip.stage !== "collapsing";

  const renderCard = (item: (typeof experiences)[number], index: number, key: string, extra: { className?: string; style?: React.CSSProperties; decorative?: boolean }) => (
    <button
      type="button"
      className={`journey-car ${extra.className ?? ""}${hoveredKey === key ? " is-hovered" : ""}${flip?.key === key ? " is-source-hidden" : ""}`}
      style={extra.style}
      key={key}
      tabIndex={extra.decorative ? -1 : undefined}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHoveredKey(key); }}
      onPointerMove={(event) => { if (event.pointerType === "mouse" && hoveredKey !== key) setHoveredKey(key); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setHoveredKey((current) => (current === key ? null : current)); }}
      onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setHoveredKey(key); }}
      onBlur={() => setHoveredKey((current) => (current === key ? null : current))}
      onClick={(event) => openCard(index, key, event.currentTarget)}
      aria-label={`Open details for ${item.company}`}
    >
      <span className="car-window" aria-hidden="true" />
      <h2>{item.company}</h2>
      <p className="journey-date">{item.date}</p>
      <p className="journey-description">{item.description}</p>
      <div className="journey-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </button>
  );

  const trainCopy = (copy: 0 | 1) => (
    <div className={`train-copy train-copy--${copy === 0 ? "a" : "b"}`} aria-hidden={copy === 1 ? true : undefined} ref={copy === 0 ? spriteRef : undefined}>
      <img className="train-sprite" src="/images/train-sprite.webp" alt="" draggable={false} />
      {WHEELS.map(([cx, cy, r], wi) => (
        <span
          className="train-wheel"
          key={`w${wi}`}
          data-r={r}
          aria-hidden="true"
          style={{
            left: `${((cx - WHEEL_TILE / 2) / TRAIN_SPRITE.w) * 100}%`,
            top: `${((cy - WHEEL_TILE / 2) / TRAIN_SPRITE.h) * 100}%`,
            width: `${(WHEEL_TILE / TRAIN_SPRITE.w) * 100}%`,
            height: `${(WHEEL_TILE / TRAIN_SPRITE.h) * 100}%`,
            backgroundPositionX: `${(wi / (WHEELS.length - 1)) * 100}%`,
          }}
        />
      ))}
      <img
        className="train-rod"
        src="/images/train-rod.webp"
        alt=""
        draggable={false}
        style={{
          left: `${(ROD_BOX[0] / TRAIN_SPRITE.w) * 100}%`,
          top: `${(ROD_BOX[1] / TRAIN_SPRITE.h) * 100}%`,
          width: `${(ROD_BOX[2] / TRAIN_SPRITE.w) * 100}%`,
          height: `${(ROD_BOX[3] / TRAIN_SPRITE.h) * 100}%`,
        }}
      />
      <span className="train-puff train-puff--1" aria-hidden="true" />
      <span className="train-puff train-puff--2" aria-hidden="true" />
      <span className="train-puff train-puff--3" aria-hidden="true" />
      {experiences.map((item, index) => renderCard(item, index, `${copy}-${item.company}`, { className: "train-card", style: panelStyle(index), decorative: copy === 1 }))}
    </div>
  );

  return (
    <section className="page experience-page" aria-labelledby="experience-title">
      <div className="train-stage" role="group" aria-label="Experience timeline">
        <img className="train-stage-plate" src="/images/experience-plate.jpg" alt="" draggable={false} />
        <div className="train-layer">
          <div className="train-run" ref={runRef}>
            {trainCopy(1)}
            {trainCopy(0)}
          </div>
        </div>
      </div>
      <p className="landscape-note journey-note">Not just internships,<br />but stepping stones<br />to a brighter me.</p>
      <HangingSign id="experience-title" title="My Journey" subtitle="Internships / Learnings / Milestones" className="journey-sign" />
      {/* Stacked list used on phones (the moving train is hidden there) */}
      <div className="journey-line" aria-label="Experience list">
        {experiences.map((item, index) => renderCard(item, index, `m-${item.company}`, { className: "journey-list-card" }))}
      </div>
      <a className="horizon-sign" href="#skills">Onwards to<br />bigger horizons <HeartIcon /></a>

      {flip && (
        <div className={`experience-scrim${scrimVisible ? " is-visible" : ""}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCard(); }}>
          <div
            className="experience-flip"
            ref={flipRef}
            data-stage={flip.stage}
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-flip-title"
            onTransitionEnd={handleFlipTransitionEnd}
          >
            <button className="dialog-close experience-flip-close" type="button" onClick={closeCard} aria-label="Close experience details">×</button>
            <div className="flip-mini" aria-hidden={flip.stage !== "mini"}>
              <span className="car-window" aria-hidden="true" />
              <h2>{active!.company}</h2>
              <p className="journey-date">{active!.date}</p>
              <p className="journey-description">{active!.description}</p>
              <div className="journey-tags">{active!.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="flip-detail" aria-hidden={flip.stage === "mini"}>
              <span className="dialog-icon"><ExperienceDetailIcon index={flip.index} /></span>
              <p className="dialog-kicker">A stop along the way</p>
              <h2 id="experience-flip-title">{active!.company}</h2>
              <p className="dialog-subtitle">{active!.date}</p>
              <p className="dialog-description">{active!.description}</p>
              <div className="journey-tags experience-flip-tags">{active!.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="dialog-actions"><button className="storybook-button storybook-button--gold" type="button" onClick={closeCard}>Back to the train</button><a href="#contact" className="dialog-contact" onClick={closeCard}>Ask me about it <ArrowIcon /></a></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type Skill = { title: string; apple: string; position: string; detail: string };

const skills: Skill[] = [
  { title: "Frontend & UI/UX", apple: "red", position: "front", detail: "Thoughtful interfaces, responsive layouts, and the details that make a product feel alive." },
  { title: "Backend Development", apple: "green", position: "backend", detail: "Server-side logic, APIs, and the systems that keep a product moving." },
  { title: "AI / ML", apple: "red-leaf", position: "ai", detail: "Curious experiments with machine learning, language models, and useful automation." },
  { title: "Tools & Technologies", apple: "yellow", position: "tools", detail: "A growing toolkit for building, testing, collaborating, and shipping." },
  { title: "Programming Languages", apple: "crimson", position: "code", detail: "Python, JavaScript, and the everyday craft of writing clear code." },
  { title: "Data & Databases", apple: "orange", position: "data", detail: "Structuring information so it can be queried, understood, and put to work." },
  { title: "Cloud & DevOps", apple: "blush", position: "cloud", detail: "Deployment, CI/CD, and the work that helps software run reliably." },
];

function SkillsPage() {
  const [selected, setSelected] = useState<Skill | null>(null);
  const selectByTitle = useCallback((title: string | null) => {
    setSelected(title ? skills.find((skill) => skill.title === title) ?? null : null);
  }, []);

  return (
    <section className="page skills-page" aria-labelledby="skills-title">
      <TreeStage skills={skills} selected={selected?.title ?? null} onSelect={selectByTitle} />
      <p className="landscape-note skills-note">Different skills.<br />Same curiosity.<br />Always growing.</p>
      <HangingSign id="skills-title" title="My Skills" subtitle="Different skills, same curiosity." className="skills-sign" />
      {/* Small screens: the tree is a backdrop and the apples are listed instead. */}
      <div className="skill-garden" aria-label="Skill categories">
        {skills.map((skill) => (
          <button
            className={`skill-fruit skill-fruit--${skill.position}${selected?.title === skill.title ? " is-selected" : ""}`}
            key={skill.title}
            type="button"
            aria-pressed={selected?.title === skill.title}
            onClick={() => setSelected((current) => current?.title === skill.title ? null : skill)}
          >
            <img className="skill-fruit__img" src={`/images/apples/apple-${skill.apple}.png`} alt="" draggable={false} />
            <span className="skill-fruit__name">{skill.title}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="skill-note" role="status">
          <button type="button" className="note-close" onClick={() => setSelected(null)} aria-label="Close skill details">×</button>
          <strong>{selected.title}</strong>
          <p>{selected.detail}</p>
        </div>
      )}
      <div className="skills-books" aria-hidden="true"><span>Better Skills</span><span>Brighter Days</span><span>Same Curiosity</span></div>
    </section>
  );
}

function AchievementIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    ball: <><circle cx="12" cy="12" r="9" /><path d="M7 4.6c2.2 1.7 3.4 3.7 3.2 6.2-2.3.7-4.5 2.3-5.7 4.6M17 4.6c-2.2 1.7-3.4 3.7-3.2 6.2 2.3.7 4.5 2.3 5.7 4.6M10.2 10.8c1.3 1.5 2 3.6 1.8 6.3M13.8 10.8c-1.3 1.5-2 3.6-1.8 6.3" /></>,
    belt: <><path d="M5 7h14v10H5zM5 11h14M10 7v10M14 7v10" /><path d="m11.5 10 1.4 1.5-1.4 1.5" /></>,
    people: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3.5 20v-1.3a5.5 5.5 0 0 1 11 0V20ZM15.2 15a4.4 4.4 0 0 1 5.3 4.3v.7h-4" /></>,
    certificate: <><rect x="4" y="3" width="16" height="14" rx="1.5" /><path d="M8 7h8M8 10h8M9 17l-1 5 4-2 4 2-1-5" /></>,
    laptop: <><rect x="4" y="4" width="16" height="12" rx="1.5" /><path d="M2.5 20h19M9 16l-1 4M15 16l1 4" /></>,
  };
  return <svg className="achievement-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[kind] || paths.certificate}</svg>;
}

function ScrapPanel({ className, title, icon, children }: { className: string; title: string; icon: string; children: React.ReactNode }) {
  return (
    <article className={`scrap-panel ${className}`}>
      <span className="panel-pin" aria-hidden="true" />
      <h2><AchievementIcon kind={icon} />{title}</h2>
      {children}
    </article>
  );
}

function AchievementsPage() {
  return (
    <section className="page achievements-page" aria-labelledby="achievements-title">
      <HangingSign id="achievements-title" title="My Achievements" subtitle="Milestones, memories and moments that made me who I am." className="achievement-sign" />
      <div className="achievement-grid">
        <ScrapPanel className="scrap-sports" title="Sports" icon="ball">
          <ul><li>State-level basketball player</li><li>Won multiple school and inter-school tournaments</li><li>Also played badminton, cricket, and other sports</li></ul>
        </ScrapPanel>
        <ScrapPanel className="scrap-personal" title="A Personal Milestone" icon="laptop">
          <h3>I Built My Portfolio</h3>
          <p>From an idea in my head to something that actually works.</p>
          <span className="portfolio-stamp">Designed / Built / Deployed</span>
        </ScrapPanel>
        <ScrapPanel className="scrap-martial" title="Martial Arts" icon="belt">
          <ul><li>Blue Belt in Taekwondo</li><li>Won Open National Championship twice</li><li>Trained for several years and competed at multiple levels</li></ul>
        </ScrapPanel>
        <ScrapPanel className="scrap-leadership" title="Leadership & Community" icon="people">
          <ul><li>Council Member (School)</li><li>Vice Sports Captain</li><li>Organized and joined school events</li><li>Enjoy being part of communities and working with people</li></ul>
        </ScrapPanel>
        <ScrapPanel className="scrap-courses" title="Certifications & Courses" icon="certificate">
          <div className="course-list">
            <div><strong>AWS Academy</strong><span>Cloud Foundations</span><small>May 2025</small></div>
            <div><strong>Matlab</strong><span>Machine Learning Techniques</span><small>Jan 2025</small></div>
            <div><strong>Udemy</strong><span>Django Essentials</span><small>Jan 2025</small></div>
          </div>
        </ScrapPanel>
        <ScrapPanel className="scrap-technical" title="Technical & Competitions" icon="laptop">
          <ul><li><strong>SIH</strong> - Selected for Smart India Hackathon (Internal)</li><li><strong>LeetCode</strong> - Around 200 days of consistency</li><li>Completed courses and built personal projects</li><li>Currently exploring deepfake video and image detection</li></ul>
        </ScrapPanel>
      </div>
    </section>
  );
}

function ContactIcon({ kind }: { kind: string }) {
  if (kind === "email") return <NavIcon name="contact" />;
  if (kind === "linkedin") return <span className="linkedin-mark" aria-hidden="true">in</span>;
  if (kind === "github") {
    return <svg className="contact-github" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.3-.3-4.7-1.2-4.7-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.2 9.2 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.7 5.1.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" /></svg>;
  }
  return <svg className="location-mark" viewBox="0 0 28 34" aria-hidden="true" fill="none"><path d="M14 31s10-11.3 10-18A10 10 0 1 0 4 13c0 6.7 10 18 10 18Z" fill="#f07868" stroke="#342519" strokeWidth="2.2" /><circle cx="14" cy="13" r="3.5" fill="#fff4da" stroke="#342519" strokeWidth="2" /></svg>;
}

function ContactPage() {
  return (
    <section className="page contact-page" aria-labelledby="contact-title">
      <HangingSign id="contact-title" title="Let's Connect!" subtitle="Ideas, opportunities, collaborations, or just a random hello - I'd love to hear from you!" className="contact-sign" />
      <div className="contact-links">
        <a className="contact-note" href="mailto:visheshsharma99@gmail.com">
          <span className="contact-nail" aria-hidden="true" /><ContactIcon kind="email" /><strong>Email</strong><span>visheshsharma99<br />@gmail.com</span><HeartIcon />
        </a>
        <a className="contact-note" href="https://linkedin.com/in/vishesh" target="_blank" rel="noreferrer">
          <span className="contact-nail" aria-hidden="true" /><ContactIcon kind="linkedin" /><strong>LinkedIn</strong><span>linkedin.com/in/vishesh</span><HeartIcon />
        </a>
        <a className="contact-note" href="https://github.com/vishesh" target="_blank" rel="noreferrer">
          <span className="contact-nail" aria-hidden="true" /><ContactIcon kind="github" /><strong>GitHub</strong><span>github.com/vishesh</span><HeartIcon />
        </a>
        <div className="contact-note contact-note--location">
          <span className="contact-nail" aria-hidden="true" /><ContactIcon kind="location" /><strong>Location</strong><span>India</span><HeartIcon />
        </div>
      </div>
    </section>
  );
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close project details">×</button>
        <span className="dialog-icon"><ProjectIcon type={project.icon} /></span>
        <p className="dialog-kicker">A little project from my world</p>
        <h2 id="project-dialog-title">{project.title}</h2>
        <p className="dialog-subtitle">{project.subtitle}</p>
        <p className="dialog-description">{project.detail}</p>
        <div className="dialog-actions"><button className="storybook-button storybook-button--gold" type="button" onClick={onClose}>Back to the map</button><a href="#contact" className="dialog-contact" onClick={onClose}>Ask me about it <ArrowIcon /></a></div>
      </section>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(getPageFromHash);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const syncPage = () => setActivePage(getPageFromHash());
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  useEffect(() => {
    document.title = `${pages.find((page) => page.id === activePage)?.label ?? "Home"} | Vishesh's Little World`;
  }, [activePage]);

  let pageContent: React.ReactNode;
  switch (activePage) {
    case "about": pageContent = <AboutPage />; break;
    case "projects": pageContent = <ProjectsPage onSelect={setSelectedProject} />; break;
    case "experience": pageContent = <ExperiencePage />; break;
    case "skills": pageContent = <SkillsPage />; break;
    case "achievements": pageContent = <AchievementsPage />; break;
    case "contact": pageContent = <ContactPage />; break;
    default: pageContent = <HomePage />;
  }

  return (
    <div className="portfolio-app">
      <Sidebar active={activePage} />
      <main className={`scene-main scene-main--${activePage}`} style={{ backgroundImage: `url(${sceneImages[activePage]})` }}>
        <div className="scene-tint" aria-hidden="true" />
        <MobileHeader active={activePage} open={mobileOpen} onToggle={() => setMobileOpen((open) => !open)} onNavigate={() => setMobileOpen(false)} />
        <div className="scene-content" key={activePage}>{pageContent}</div>
      </main>
      {selectedProject && <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}