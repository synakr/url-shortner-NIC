import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import LogoCarousel from "./LogoCarousel";
import AccessibilityDropdown from "./AccessibilityDropdown";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* 1. JHVMS Saffron Top Bar */}
      <div className="tripura-top-bar">
        <div className="tripura-top-bar-left">
          <span>त्रिपुरा सरकार | GOVERNMENT OF TRIPURA</span>
          <a href="#main-content" className="tripura-skip-link">
            Skip to main content
          </a>
        </div>
        <div className="tripura-top-bar-right">
          <div className="tripura-social-icons">
            <a href="https://www.facebook.com/NICIndia/" target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://twitter.com/NICMeity" target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ color: 'inherit', display: 'flex', alignItems: 'center', marginLeft: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/national-informatics-centre" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: 'inherit', display: 'flex', alignItems: 'center', marginLeft: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
          <div className="tripura-font-tools">
            <AccessibilityDropdown />
          </div>
          <div className="tripura-lang-selector">
            <span style={{ fontSize: '10px' }}>🌐</span>
            <span>ENGLISH</span>
          </div>
        </div>
      </div>

      {/* 2. Bilingual Tripura NIC Header Banner */}
      <header className="tripura-header-banner">
        <div className="tripura-header-container">
          <a href="https://tripura.gov.in" target="_blank" rel="noopener noreferrer" className="tripura-header-left hover:opacity-90 transition-opacity" style={{ textDecoration: 'none' }}>
            <img src="/src/assets/national_emblem.svg" alt="National Emblem" className="tripura-emblem" />
            <div>
              <div className="tripura-title-hindi">राष्ट्रीय सूचना विज्ञान केन्द्र</div>
              <h1 className="tripura-title-english">National Informatics Centre</h1>
              <div className="tripura-title-state">त्रिपुरा राज्य एकक, अगरतला | Tripura State Unit, Agartala</div>
            </div>
          </a>
          <div className="tripura-header-right">
            <div className="tripura-header-right-text hidden md:block">
              <div className="tripura-dept-title">DEPARTMENT OF ELECTRONICS & IT</div>
              <div className="tripura-dept-sub">Ministry of Electronics & Information Technology, GoI</div>
            </div>
            <div className="tripura-header-divider hidden md:block"></div>
            <a href="https://www.nic.in" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/src/assets/NIC_logo.svg" alt="NIC Logo" className="tripura-nic-logo" />
            </a>
          </div>
        </div>
      </header>

      {/* 3. Navy Blue Navigation Bar */}
      <nav className="tripura-nav-bar shadow-md">
        <div className="tripura-nav-container">
          <div className="tripura-nav-links">
            <Link to="/dashboard" className={`tripura-nav-link${location.pathname === "/dashboard" ? " active" : ""}`}>Home</Link>
            <Link to="/my-urls" className={`tripura-nav-link${location.pathname === "/my-urls" ? " active" : ""}`}>My Links</Link>
            <Link to="/expired-urls" className={`tripura-nav-link${location.pathname === "/expired-urls" ? " active" : ""}`}>Expired Links</Link>
            <Link to="/analytics" className={`tripura-nav-link${location.pathname === "/analytics" ? " active" : ""}`}>Analytics</Link>
            <Link to="/profile" className={`tripura-nav-link${location.pathname === "/profile" ? " active" : ""}`}>Profile</Link>
          </div>
          <Link to="/admin" className="tripura-admin-portal-btn">
            <span>➜</span> Admin Portal
          </Link>
        </div>
      </nav>

      {/* 3b. Latest News Ticker Band */}
      <div className="tripura-ticker-band">
        <div className="tripura-ticker-badge">LATEST NEWS</div>
        <div className="tripura-ticker-container">
          <div className="tripura-ticker-content">
            Secure URL Shortening service is active • Direct high-speed Redis caching activated at NIC Agartala Data Centre • GIGW v3.0 accessibility standard integrated • Double-layered security protocols initialized •
          </div>
        </div>
      </div>

      {/* 4. App Shell Content Wrapper */}
      <div className={`flex-1 flex app-wrapper${sidebarOpen ? " sidebar-open" : " sidebar-closed"}`}>
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
        <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} />
        
        <div className="main-area">
          <header className="top-bar">
            <button
              type="button"
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-expanded={sidebarOpen}
            >
              <Menu size={22} />
            </button>
            <span className="font-semibold text-[var(--color-primary)] text-sm">LinkSnap Administrative Workspace</span>
          </header>
          <main id="main-content" className="main-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 4b. JHVMS Partner logo carousel */}
      <LogoCarousel />

      {/* 5. GIGW Footer (from NIC Tripura Footer & Carousel project) */}
      <footer className="tripura-footer">
        <div className="tripura-footer-container">
          {/* Link Row */}
          <div className="tripura-footer-links">
            <a href="https://tripura.nic.in/policies/" target="_blank" rel="noopener noreferrer">Website Policies</a>
            <span className="tripura-footer-divider">|</span>
            <a href="https://tripura.nic.in/contact-us/" target="_blank" rel="noopener noreferrer">Contact Us</a>
            <span className="tripura-footer-divider">|</span>
            <a href="https://tripura.nic.in/help/" target="_blank" rel="noopener noreferrer">Help</a>
            <span className="tripura-footer-divider">|</span>
            <a href="https://tripura.nic.in/contact-us/" target="_blank" rel="noopener noreferrer">Web Information Manager</a>
          </div>

          {/* Description */}
          <div className="tripura-footer-desc">
            <p>
              © 2026. All rights reserved. Content owned by National Informatics Centre (NIC) Tripura. Site designed and hosted by National Informatics Centre, Ministry of Electronics &amp; Information Technology, Government of India.
            </p>
            <span className="updated-date">
              Last Updated: Jul 09, 2026
            </span>
          </div>

          {/* Bottom Branding */}
          <div className="tripura-footer-branding">
            <a href="https://s3waas.gov.in/" target="_blank" rel="noopener noreferrer" className="tripura-footer-brand-item hover:opacity-80 transition-opacity" style={{ display: 'flex', alignItems: 'center' }}>
              <img style={{ height: 40, objectFit: 'contain' }} alt="SwaaS Logo" src="/src/assets/swaas.png"/>
            </a>
            <div className="tripura-footer-logo-separator"></div>
            <a href="https://www.digitalindia.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ display: 'flex', alignItems: 'center' }}>
              <img style={{ height: 48, objectFit: 'contain' }} alt="Digital India Logo" src="/src/assets/digital_india.svg"/>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
