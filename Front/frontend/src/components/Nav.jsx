import React, { useState, useEffect } from "react";
import { BiX, BiMenu } from "react-icons/bi";
import { FaShieldAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

function Nav() {
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setShowMenu(!showMenu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide nav on login / role dashboards for cleaner UX (optional - keep always visible for public)
  const isAuthPage = location.pathname === "/login" || location.pathname === "/forgotPassword";

  if (isAuthPage) return null;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "text-white bg-white/15"
        : "text-brand-100 hover:text-white hover:bg-white/10"
    }`;

  return (
    <nav
      className={`fixed w-full z-50 top-0 transition-all duration-300 ${
        scrolled
          ? "bg-brand-950/95 backdrop-blur-xl shadow-lg shadow-brand-950/20 py-2"
          : "bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 py-3"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/mtefp_logo.jpeg"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-accent-400 transition-all"
            alt="logo MTEFoP"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span className="font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1.5">
            <FaShieldAlt className="text-accent-400 text-base hidden sm:inline" />
            e-Parapheur
          </span>
        </Link>

        {/* Center logo (desktop) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <img
            src="/Rpp.png"
            alt=""
            className="w-16 h-auto opacity-90"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          <Link className={linkClass("/")} to="/">
            Accueil
          </Link>
          <a className={linkClass("#infos")} href="#infos">
            Infos
          </a>
          <Link className={linkClass("/support")} to="/support">
            Support
          </Link>
          <Link
            to="/mydoc"
            className="ml-3 btn-primary !py-2.5 !px-5 !text-sm !rounded-full"
          >
            Mon Dossier
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          {showMenu ? <BiX size={28} /> : <BiMenu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          showMenu ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-2 flex flex-col gap-1 bg-brand-950/95 backdrop-blur-xl border-t border-white/10">
          <Link
            className="px-4 py-3 rounded-xl text-white font-medium hover:bg-white/10"
            to="/"
            onClick={() => setShowMenu(false)}
          >
            Accueil
          </Link>
          <a
            className="px-4 py-3 rounded-xl text-brand-100 hover:bg-white/10 hover:text-white"
            href="#infos"
            onClick={() => setShowMenu(false)}
          >
            Infos
          </a>
          <Link
            className="px-4 py-3 rounded-xl text-brand-100 hover:bg-white/10 hover:text-white"
            to="/support"
            onClick={() => setShowMenu(false)}
          >
            Support
          </Link>
          <Link
            to="/mydoc"
            className="btn-primary mt-2 text-center"
            onClick={() => setShowMenu(false)}
          >
            Mon Dossier
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
