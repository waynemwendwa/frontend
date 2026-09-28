import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "./ThemeToggle";

function AppShell({
  appLabel,
  roleLabel,
  userName,
  onLogout,
  navItems = [],
  navVariant = "top",
  children,
}) {
  const location = useLocation();
  const useSidebar = navVariant === "sidebar";

  return (
    <div className="ds-app-shell">
      <a href="#main-content" className="ds-skip-link">
        Skip to content
      </a>

      <header className="ds-header" role="banner">
        <div className="ds-header-inner">
          <div className="ds-branding">
            <div className="ds-logo-dot" aria-hidden="true" />
            <div>
              <p className="ds-brand-name">{appLabel}</p>
              {/* <p className="ds-brand-subtitle">Student success platform</p> */}
            </div>
          </div>

          <div className="ds-header-actions">
            <ThemeToggle compact />
            {/* {roleLabel && <span className="ds-badge">{roleLabel}</span>} */}
            {userName && <span className="ds-user-chip">{userName}</span>}
            <button className="ds-icon-button" onClick={onLogout} type="button">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {!useSidebar && navItems.length > 0 && (
        <nav className="ds-top-nav" aria-label="Primary navigation">
          <div className="ds-top-nav-inner">
            {navItems.map((item) => {
              const active = item.match
                ? item.match(location.pathname)
                : location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`ds-nav-link ${active ? "is-active" : ""}`.trim()}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {useSidebar ? (
        <div className="ds-content-grid">
          {navItems.length > 0 && (
            <aside className="ds-side-panel" aria-label="Admin navigation">
              <div className="ds-side-panel-inner">
                <p className="ds-side-panel-title">Navigation</p>
                <nav className="ds-side-nav" aria-label="Primary navigation">
                  {navItems.map((item) => {
                    const active = item.match
                      ? item.match(location.pathname)
                      : location.pathname === item.to;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`ds-side-link ${active ? "is-active" : ""}`.trim()}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}

          <main id="main-content" className="ds-main-content" role="main">
            {children}
          </main>
        </div>
      ) : (
        <main id="main-content" className="ds-main-content" role="main">
          {children}
        </main>
      )}

      
    </div>
  );
}

export default AppShell;
