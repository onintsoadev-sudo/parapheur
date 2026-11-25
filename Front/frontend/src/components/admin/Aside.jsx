import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import axiosRequest from "../../axiosClient/axiosClient";
import {
  RiDashboardLine,
  RiUserAddLine,
  RiTeamLine,
  RiBuildingLine,
  RiMessage3Line,
  RiLogoutBoxRLine,
  RiFileList3Line,
  RiShieldStarLine,
} from "react-icons/ri";

const links = [
  { to: "/admin", label: "Tableau de bord", icon: RiDashboardLine },
  { to: "/admin/userregister", label: "Nouvel utilisateur", icon: RiUserAddLine },
  { to: "/admin/usersList", label: "Utilisateurs", icon: RiTeamLine },
  { to: "/admin/sccservdirdg", label: "Org. DG / Dir / Serv", icon: RiBuildingLine },
  { to: "/admin/listDeparts", label: "Départements", icon: RiFileList3Line },
  { to: "/admin/messages", label: "Messages support", icon: RiMessage3Line },
];

function Aside({ setShow, show }) {
  const location = useLocation();
  const [loading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosRequest.post("/logout");
      localStorage.removeItem("ACCESS_TOKEN");
      setIsLoading(false);
      window.location.href = "/login";
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || "Erreur déconnexion");
    }
  };

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const NavLinks = ({ onNavigate }) => (
    <nav className="flex-1 px-3 space-y-1 mt-6">
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive(to)
              ? "bg-white/15 text-white shadow-inner ring-1 ring-white/10"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon size={20} className={isActive(to) ? "text-accent-400" : ""} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 text-white border-r border-white/5">
        <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
          <img src="/mtefp_logo.jpeg" alt="logo" className="w-10 h-10 rounded-full ring-2 ring-accent-400/40 object-cover" />
          <div>
            <p className="font-bold text-white leading-tight">e-Parapheur</p>
            <p className="text-[11px] text-brand-300 flex items-center gap-1">
              <RiShieldStarLine /> Admin
            </p>
          </div>
        </div>
        <NavLinks />
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 transition-colors"
          >
            {loading ? <BeatLoader size={8} color="#fecaca" /> : <><RiLogoutBoxRLine size={18} /> Déconnexion</>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {show && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShow(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-brand-950 to-brand-900 text-white shadow-2xl flex flex-col animate-slide-in-left">
            <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
              <img src="/mtefp_logo.jpeg" alt="logo" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-bold">e-Parapheur</span>
            </div>
            <NavLinks onNavigate={() => setShow(false)} />
            <div className="p-4 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-500/20 text-rose-200">
                {loading ? <BeatLoader size={8} color="#fecaca" /> : <><RiLogoutBoxRLine size={18} /> Déconnexion</>}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Aside;
