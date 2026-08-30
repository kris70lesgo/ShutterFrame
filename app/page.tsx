import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ShutterFrame — Migration Rehearsal Infrastructure",
  description: "Rehearse database migrations from exact pull-request commits before production.",
};

const heroVideoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4";

function LogoMark({ className = "" }: { className?: string }) {
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <g transform="rotate(-30 12 12)">
      <circle cx="7.3" cy="3.2" r="1.45" />
      <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
      <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
      <circle cx="16.7" cy="20.8" r="1.45" />
    </g>
  </svg>;
}

function SparkleIcon() {
  return <svg className="badge-star" width="18" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
  </svg>;
}

function WorkflowIcon() {
  return <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
    <defs>
      <linearGradient id="workflowLeft" x1="3" y1="2" x2="14" y2="22">
        <stop stopColor="#ffffff" stopOpacity="0.38" />
        <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
      </linearGradient>
      <linearGradient id="workflowRight" x1="14" y1="2" x2="23" y2="22">
        <stop stopColor="#3a3a3a" stopOpacity="0.38" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
      </linearGradient>
    </defs>
    <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#workflowLeft)" />
    <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#workflowRight)" />
    <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
  </svg>;
}

function BranchIcon() {
  return <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
    <path d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85" fill="none" stroke="#111111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.85" />
  </svg>;
}

function TeamIcon() {
  return <svg className="stat-icon-wide" viewBox="0 0 40 22" aria-hidden="true">
    <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
    <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
    <path d="M6.6 8.8l-1.4-3.2 3.1 1.5M13.8 8.8l1.4-3.2-3.1 1.5" fill="#f4f4f4" />
    <circle cx="8.8" cy="11.7" r=".7" fill="#1a1a1a" />
    <circle cx="11.7" cy="11.7" r=".7" fill="#1a1a1a" />
    <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
    <circle cx="17.1" cy="10" r="1.7" fill="#111111" />
    <circle cx="23.3" cy="10" r="1.7" fill="#111111" />
    <ellipse cx="20.2" cy="12.6" rx="1" ry=".7" fill="#111111" />
    <path d="M17.4 14.8c1.7 1.2 3.9 1.2 5.6 0" fill="none" stroke="#111111" strokeLinecap="round" strokeWidth="1.2" />
    <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
    <text x="30.2" y="15.1" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12.5" fontWeight="700" fill="#ffffff">s</text>
  </svg>;
}

export default function LandingPage() {
  return <div className="sf-landing" style={{ background: "#000", color: "#fff" }}>
    <style dangerouslySetInnerHTML={{ __html: landingCss }} />
    <div className="grain" aria-hidden="true" />
    <video className="hero-photo" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
      <source src={heroVideoUrl} type="video/mp4" />
    </video>
    <div className="page">
      <div className="menu-backdrop" aria-hidden="true" />
      <header className="header">
        <Link className="logo appear appear--scale" href="#top" aria-label="ShutterFrame" style={{ "--d": "0.08s" } as React.CSSProperties}>
          <LogoMark />
          <span>ShutterFrame</span>
        </Link>
        <nav id="site-nav" aria-label="Primary">
          <Link className="nav-pill appear appear--scale" href="/dashboard" style={{ "--d": "0.16s" } as React.CSSProperties}>Dashboard</Link>
          <Link className="nav-pill appear appear--soft" href="/rehearsals" style={{ "--d": "0.28s" } as React.CSSProperties}>Rehearsals</Link>
          <Link className="nav-pill appear appear--scale" href="/integrations" style={{ "--d": "0.40s" } as React.CSSProperties}>Integrations</Link>
          <Link className="nav-pill appear appear--soft" href="/rehearsals" style={{ "--d": "0.52s" } as React.CSSProperties}>Run Demo</Link>
        </nav>
        <Link className="btn btn-solid header-cta appear appear--scale" href="/dashboard" style={{ "--d": "0.34s" } as React.CSSProperties}>Open app</Link>
        <button className="burger appear appear--scale" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu" style={{ "--d": "0.34s" } as React.CSSProperties}>
          <span /><span /><span />
        </button>
      </header>
      <main className="hero" id="top">
        <div className="hero-copy">
          <div className="badge appear appear--pop" style={{ "--d": "0.22s" } as React.CSSProperties}><SparkleIcon /> Migration Rehearsal Infrastructure</div>
          <h1>
            <span className="headline-line"><span className="appear appear--mask" style={{ "--d": "0.42s" } as React.CSSProperties}>Rehearse <em>database changes</em></span></span>
            <span className="headline-line"><span className="appear appear--mask" style={{ "--d": "0.62s" } as React.CSSProperties}>before production.</span></span>
          </h1>
          <p className="lede appear appear--soft" style={{ "--d": "0.82s", "--dur": "1.25s" } as React.CSSProperties}>ShutterFrame turns a pull request into an auditable migration rehearsal with Neon preview branches, sandbox evidence, and human approval.</p>
          <div className="hero-actions">
            <Link className="btn btn-solid hero-btn appear appear--btn" href="/dashboard" style={{ "--d": "0.96s" } as React.CSSProperties}>Open dashboard</Link>
            <Link className="btn btn-ghost hero-btn appear appear--side" href="/rehearsals" style={{ "--d": "1.10s" } as React.CSSProperties}>Run a rehearsal</Link>
          </div>
        </div>
      </main>
      <footer className="stats" aria-label="ShutterFrame stats">
        <div className="stat appear appear--stat" style={{ "--d": "1.12s" } as React.CSSProperties}><WorkflowIcon /> Exact PR commits verified</div>
        <div className="stat appear appear--stat" style={{ "--d": "1.28s" } as React.CSSProperties}><BranchIcon /> Disposable Neon branches</div>
        <div className="stat appear appear--stat" style={{ "--d": "1.44s" } as React.CSSProperties}><TeamIcon /> Human-reviewed run evidence</div>
      </footer>
    </div>
    <Script id="landing-menu-motion" strategy="afterInteractive">{landingScript}</Script>
  </div>;
}

const landingScript = `
(() => {
  const body = document.body;
  const burger = document.querySelector(".burger");
  const nav = document.querySelector("#site-nav");
  const closeMenu = () => {
    body.classList.remove("menu-open");
    burger?.setAttribute("aria-expanded", "false");
    burger?.setAttribute("aria-label", "Open menu");
  };
  const openMenu = () => {
    body.classList.add("menu-open");
    burger?.setAttribute("aria-expanded", "true");
    burger?.setAttribute("aria-label", "Close menu");
  };
  document.querySelectorAll(".appear").forEach((el) => {
    el.addEventListener("animationend", () => el.classList.add("is-in"), { once: true });
  });
  const photo = document.querySelector(".hero-photo");
  photo?.addEventListener("animationend", () => photo.classList.add("is-in"), { once: true });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const animated = Array.from(document.querySelectorAll(".appear, .hero-photo"));
    if (!animated.some((el) => el.getAnimations?.().some((anim) => ["running", "finished"].includes(anim.playState)))) {
      animated.forEach((el) => el.classList.add("is-in"));
    }
  }));
  burger?.addEventListener("click", () => body.classList.contains("menu-open") ? closeMenu() : openMenu());
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => { if (event.matches) closeMenu(); });
})();
`;

const landingCss = `
html, body { background: #000000 !important; color: #ffffff; }
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Instrument+Serif:ital@1&display=swap");
html, body { background: #000000; background: var(--bg, #000000); color: #ffffff; color: var(--text, #ffffff); }
.sf-landing, .sf-landing * { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; overflow-x: hidden; position: relative; }
.sf-landing { --bg: #000000; --text: #ffffff; --muted: #9a9a9a; --stat: #d8d8d8; --border: rgba(255, 255, 255, 0.16); --border-soft: rgba(255, 255, 255, 0.12); --logo: 15.5px; --nav: 14px; --nav-h: 40px; --btn: 13.5px; --btn-h: 40px; --hero-btn-h: 42px; --h1: 48px; --lede: 15.5px; --badge: 12.5px; --stat-size: 13.5px; --header-y: 22px; --header-x: 40px; --stats-x: 72px; --stats-y: 36px; --hero-gap: 85px; --copy-max: 860px; --lede-max: 470px; min-height: 100vh; min-height: 100dvh; overflow: hidden; font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #000; color: #fff; }
.sf-landing a { color: inherit; text-decoration: none; }
.sf-landing button { font-family: inherit; }
.grain { pointer-events: none; position: fixed; inset: 0; z-index: 100; opacity: .18; background-image: radial-gradient(circle at 25% 20%, rgba(255,255,255,.22) 0 1px, transparent 1px), radial-gradient(circle at 75% 70%, rgba(255,255,255,.16) 0 1px, transparent 1px); background-size: 3px 3px, 4px 4px; mix-blend-mode: overlay; }
.hero-photo { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1; filter: saturate(.92) contrast(1.02); animation: in-soft 1.4s cubic-bezier(.16,1,.3,1) both; }
.hero-photo::after { content: ""; position: absolute; inset: 0; }
.sf-landing::after { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 50% 28%, rgba(255,255,255,.08), transparent 34%), linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.52) 62%, rgba(0,0,0,.72)); }
.page { position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; min-height: 100dvh; overflow: hidden; }
.header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: var(--header-y) var(--header-x) 10px; position: relative; z-index: 50; }
.logo { display: inline-flex; align-items: center; gap: 9px; justify-self: start; font-size: var(--logo); font-weight: 600; letter-spacing: -.03em; color: #fff; }
#site-nav { display: flex; align-items: center; gap: 8px; justify-self: center; }
.nav-pill { position: relative; overflow: hidden; display: inline-flex; align-items: center; height: var(--nav-h); padding: 0 18px; border-radius: 7px; border: 1px solid rgba(198,198,198,.55); background: linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%); color: #f3f3f3; font-size: var(--nav); font-weight: 400; letter-spacing: -.01em; white-space: nowrap; transition: background .35s ease, border-color .35s ease, box-shadow .35s ease; }
.nav-pill::before { content: ""; position: absolute; inset: 0; transform: translateX(-120%); background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.16) 50%, transparent 70%); transition: transform .6s ease; }
.nav-pill:hover { border-color: rgba(235,235,235,.9); background: linear-gradient(105deg, #111 0%, #3a3a3a 45%, #6a6a6a 100%); box-shadow: 0 0 18px rgba(200,210,230,.18); }
.nav-pill:hover::before { transform: translateX(120%); }
.header-cta { justify-self: end; }
.btn { position: relative; isolation: isolate; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; height: var(--btn-h); padding: 0 16px; border-radius: 6px; font-size: var(--btn); font-weight: 500; letter-spacing: -.02em; line-height: 1; white-space: nowrap; cursor: pointer; transition: background .35s ease, border .35s ease, box-shadow .35s ease, color .35s ease, filter .35s ease; }
.btn::after { content: ""; position: absolute; inset: 0; z-index: -1; transform: translateX(-130%); background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,.45) 48%, transparent 76%); transition: transform .65s ease; }
.btn:hover::after { transform: translateX(130%); }
.btn-solid { background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%); color: #111; border: 1px solid #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,.95); }
.btn-solid:hover { background: linear-gradient(180deg, #fff 0%, #f3f6ff 42%, #d5def2 100%); border-color: #f2f6ff; box-shadow: inset 0 1px 0 #fff, 0 0 22px rgba(186,208,255,.35), 0 8px 18px rgba(255,255,255,.12); }
.btn-ghost { background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(0,0,0,.5) 46%, rgba(150,170,200,.1)); color: #fff; border: 1px solid rgba(198,198,198,.55); box-shadow: inset 0 1px 0 rgba(255,255,255,.12); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.btn-ghost:hover { border-color: rgba(220,230,255,.8); box-shadow: inset 0 1px 0 rgba(255,255,255,.22), 0 0 24px rgba(170,200,255,.28); }
.hero-btn { height: var(--hero-btn-h); padding: 0 18px; }
.hero { display: flex; align-items: flex-end; justify-content: center; min-height: 0; padding: 8px 24px var(--hero-gap); }
.hero-copy { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; max-width: var(--copy-max); width: 100%; }
.badge { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; padding: 9px 15px; border: 0; border-radius: 5px; background: linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%); color: #f2f2f2; font-size: var(--badge); font-weight: 400; letter-spacing: -.01em; }
.badge-star { filter: drop-shadow(0 0 3px rgba(255,255,255,.45)); animation: in-star .9s .28s both; }
.hero h1 { display: flex; flex-direction: column; align-items: center; color: #fff; font-size: var(--h1); font-weight: 500; letter-spacing: -.045em; line-height: 1.12; }
.headline-line { display: block; overflow: hidden; padding: .06em .15em .14em; }
.hero h1 em { font-family: "Instrument Serif", "Times New Roman", Times, serif; font-style: italic; font-weight: 400; font-size: 1.08em; letter-spacing: -.03em; color: #9a9a9a; animation: in-em 1.2s .72s both; }
.lede { max-width: var(--lede-max); margin-top: 18px; color: #9a9a9a; font-size: var(--lede); font-weight: 400; line-height: 1.55; letter-spacing: -.015em; }
.hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 26px; }
.stats { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 0 var(--stats-x) max(var(--stats-y), env(safe-area-inset-bottom)); color: #d8d8d8; }
.stat { display: inline-flex; align-items: center; gap: 14px; font-size: var(--stat-size); letter-spacing: -.015em; white-space: nowrap; }
.stat-icon { width: 20px; height: 20px; color: #e8e8e8; }
.stat-icon-wide { width: 38px; height: 21px; }
.burger { display: none; width: 42px; height: 42px; place-items: center; border-radius: 6px; border: 1px solid var(--border); background: rgba(8,8,8,.55); z-index: 60; color: #fff; }
.burger span { display: block; width: 16px; height: 1.5px; border-radius: 1px; background: #fff; transition: transform .25s ease, opacity .2s ease; }
.burger span + span { margin-top: 5px; }
.menu-open .burger span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.menu-open .burger span:nth-child(2) { opacity: 0; }
.menu-open .burger span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
.menu-backdrop { display: none; }
.appear { opacity: 1; animation-duration: var(--dur, 1.05s); animation-fill-mode: both; animation-timing-function: cubic-bezier(.16,1,.3,1); animation-delay: var(--d, .08s); }
.appear.is-in, .hero-photo.is-in { animation: none; opacity: 1; transform: none; clip-path: none; filter: none; }
.appear--scale { animation-name: in-scale; }
.appear--soft { animation-name: in-soft; }
.appear--mask { animation-name: in-mask; display: inline-block; }
.appear--pop { animation-name: in-pop; }
.appear--btn { animation-name: in-btn; }
.appear--side { animation-name: in-side; }
.appear--stat { animation-name: in-stat; }
@keyframes in-scale { from { opacity: 0; transform: scale(.84); } to { opacity: 1; transform: scale(1); } }
@keyframes in-soft { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes in-mask { from { opacity: 0; transform: translateY(40%); } to { opacity: 1; transform: translateY(0); } }
@keyframes in-pop { 0% { opacity: 0; transform: scale(.9); } 70% { opacity: 1; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
@keyframes in-btn { from { opacity: 0; transform: translateY(18px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes in-side { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: translateX(0); } }
@keyframes in-stat { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes in-star { 0% { opacity: 0; transform: scale(.2) rotate(-50deg); } 65% { opacity: 1; transform: scale(1.2) rotate(8deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes in-em { from { opacity: .35; filter: blur(4px); } to { opacity: 1; filter: blur(0); } }
@media (min-width: 1600px) { .sf-landing { --logo: 17px; --nav: 15px; --nav-h: 44px; --btn: 15px; --btn-h: 44px; --hero-btn-h: 48px; --h1: 64px; --lede: 18px; --badge: 13.5px; --stat-size: 15px; --header-y: 28px; --header-x: 64px; --stats-x: 96px; --stats-y: 44px; --copy-max: 980px; --lede-max: 540px; } .nav-pill { padding: 0 20px; } .badge { margin-bottom: 26px; } .lede { margin-top: 22px; } .hero-actions { margin-top: 30px; gap: 12px; } .stat-icon { width: 22px; height: 22px; } .stat-icon-wide { width: 45px; height: 24px; } }
@media (min-width: 1920px) { .sf-landing { --logo: 18px; --nav: 16px; --nav-h: 48px; --btn: 16px; --btn-h: 48px; --hero-btn-h: 52px; --h1: 76px; --lede: 20px; --badge: 14.5px; --stat-size: 16px; --header-y: 32px; --header-x: 80px; --stats-x: 120px; --stats-y: 52px; --copy-max: 1120px; --lede-max: 620px; } #site-nav { gap: 10px; } .nav-pill, .btn { padding-left: 22px; padding-right: 22px; } .badge { padding: 10px 15px; } .stat-icon-wide { width: 48px; height: 26px; } }
@media (min-width: 2560px) { .sf-landing { --h1: 88px; --lede: 22px; --header-x: 120px; --stats-x: 160px; --copy-max: 1280px; --lede-max: 680px; } }
@media (min-width: 1280px) and (max-width: 1599px) { .sf-landing { --h1: 54px; --lede: 16px; --header-x: 48px; --stats-x: 80px; --copy-max: 900px; } }
@media (min-width: 901px) and (max-width: 1279px) { .sf-landing { --logo: 15px; --nav: 13px; --nav-h: 36px; --btn: 13px; --btn-h: 38px; --hero-btn-h: 40px; --h1: 42px; --lede: 15px; --badge: 12px; --stat-size: 12.5px; --header-y: 16px; --header-x: 28px; --stats-x: 36px; --stats-y: 28px; --hero-gap: 64px; --copy-max: 760px; --lede-max: 440px; } .nav-pill { padding: 0 14px; } .badge { margin-bottom: 16px; } .lede { margin-top: 14px; } .hero-actions { margin-top: 20px; } }
@media (min-width: 901px) and (max-height: 850px) { .sf-landing { --header-y: 14px; --stats-y: 24px; --hero-gap: 48px; --h1: 40px; } .badge { margin-bottom: 12px; } .lede { margin-top: 12px; } .hero-actions { margin-top: 16px; } }
@media (min-width: 901px) and (max-height: 720px) { .sf-landing { --h1: 34px; --lede: 14px; --hero-gap: 32px; --stats-y: 18px; --nav-h: 30px; --btn-h: 34px; --hero-btn-h: 36px; } .badge { margin-bottom: 8px; } }
@media (min-width: 901px) { html, body { height: 100%; overflow: hidden; } .page { height: 100vh; height: 100dvh; overflow: hidden; } }
@media (max-width: 900px) { html, body { height: auto; overflow-y: auto; } .sf-landing { --logo: 16px; --btn: 15px; --btn-h: 46px; --hero-btn-h: 48px; --h1: 36px; --lede: 16.5px; --badge: 13.5px; --stat-size: 15px; --header-y: 16px; --header-x: 18px; --stats-x: 20px; --stats-y: 28px; --hero-gap: 36px; min-height: 100dvh; overflow: visible; } .header { grid-template-columns: 1fr auto auto; gap: 8px; padding-top: max(16px, env(safe-area-inset-top)); } .logo, .header-cta, .burger { z-index: 80; } .burger { display: grid; } .menu-backdrop { display: block; position: fixed; inset: 0; z-index: 40; background: rgba(8,8,8,.42); opacity: 0; visibility: hidden; transition: opacity .28s ease, visibility .28s ease, backdrop-filter .28s ease; } .menu-open .menu-backdrop { opacity: 1; visibility: visible; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); } #site-nav { position: fixed; inset: 0; z-index: 45; display: flex; flex-direction: column; justify-content: center; gap: 12px; padding: max(96px, calc(env(safe-area-inset-top) + 88px)) 22px 32px; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .25s ease, visibility .25s ease; } .menu-open #site-nav { opacity: 1; visibility: visible; pointer-events: auto; } .nav-pill { width: 100%; height: 56px; justify-content: center; border-radius: 10px; font-size: 19px; } .hero { padding: 20px 20px 64px; align-items: flex-end; } .hero-copy, .lede { max-width: 100%; } .stats { flex-direction: column; justify-content: center; gap: 16px; text-align: center; white-space: normal; } .stat { white-space: normal; } body.menu-open { overflow: hidden; } }
@media (max-width: 560px) { .sf-landing { --h1: 34px; --lede: 16px; --header-x: 16px; } .hero-actions { width: 100%; flex-direction: column; } .hero-actions .btn { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .sf-landing *, .sf-landing *::before, .sf-landing *::after { transition: none !important; animation: none !important; } .appear, .hero-photo, .hero h1 em, .badge-star { opacity: 1; transform: none; clip-path: none; filter: none; } }
`;
