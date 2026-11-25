import { Link, useLocation } from "react-router-dom";
import { BiTask, BiTransfer } from "react-icons/bi";
import { SiTransifex } from "react-icons/si";
import { CgChart } from "react-icons/cg";
import { RiLogoutBoxRLine, RiShieldKeyholeLine } from "react-icons/ri";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import axiosRequest from "../../axiosClient/axiosClient";

function Aside({ toggleMenu, menu, user }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const isActive = (path) =>
    path === "/sp"
      ? location.pathname === "/sp"
      : location.pathname.toLowerCase().startsWith(path.toLowerCase());

  const logout = async () => {
    setLoading(true);
    try {
      await axiosRequest.post("/logout");
      localStorage.removeItem("ACCESS_TOKEN");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.message || "Erreur");
      setLoading(false);
    }
  };

  const links = [
    { to: "/sp", label: "Courriers", icon: BiTask },
    { to: "/sp/listTrans", label: "Transferts", icon: BiTransfer },
    { to: "/sp/listTraite", label: "Acheminements", icon: SiTransifex },
    { to: "/sp/stats", label: "Reporting", icon: CgChart },
  ];

  const content = (
    <>
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
        <img src="/mtefp_logo.jpeg" className="w-10 h-10 rounded-full object-cover ring-2 ring-accent-400/30" alt="" />
        <div>
          <p className="font-bold text-white">e-Parapheur</p>
          <p className="text-[11px] text-brand-300">Espace SP</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-5" onClick={toggleMenu}>
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(to)
                ? "bg-white/15 text-white ring-1 ring-white/10"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={20} className={isActive(to) ? "text-accent-400" : ""} />
            {label}
          </Link>
        ))}
        {user?.role === "admin" && (
          <Link to="/admin" className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
            <RiShieldKeyholeLine size={20} /> Administrateur
          </Link>
        )}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-500/15 text-rose-200 hover:bg-rose-500/25">
          {loading ? <BeatLoader size={8} color="#fecaca" /> : <><RiLogoutBoxRLine size={18} /> Déconnexion</>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-gradient-to-b from-brand-950 via-brand-900 to-brand-800 text-white border-r border-white/5">
        {content}
      </aside>
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleMenu} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-brand-950 to-brand-900 text-white shadow-2xl flex flex-col animate-slide-in-left">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export default Aside;
