import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { RiLogoutBoxRLine, RiUserLine } from "react-icons/ri";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import { userContext } from "../ContextWrapper";
import axiosRequest from "../../axiosClient/axiosClient";

function Header({ show, setShow }) {
  const { user } = useContext(userContext);
  const [dropMenu, setDropMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDropMenu = () => setDropMenu(!dropMenu);

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosRequest.post("/logout");
      localStorage.removeItem("ACCESS_TOKEN");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.message || "Erreur");
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Menu"
        >
          <BiMenu size={24} />
        </button>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Administration</p>
          <h1 className="text-sm sm:text-base font-semibold text-slate-800">Espace Admin</h1>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={toggleDropMenu}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white text-xs font-bold flex items-center justify-center">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
            {user?.name || "Admin"}
          </span>
        </button>

        {dropMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropMenu(false)} />
            <ul className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-card animate-fade-down">
              <Link to="/admin/profil" onClick={() => setDropMenu(false)}>
                <li className="flex items-center gap-2 cursor-pointer text-slate-700 text-sm rounded-lg px-3 py-2.5 hover:bg-slate-50">
                  <RiUserLine /> Mon compte
                </li>
              </Link>
              <li
                onClick={logout}
                className="flex items-center gap-2 cursor-pointer text-rose-600 text-sm rounded-lg px-3 py-2.5 hover:bg-rose-50"
              >
                {isLoading ? <BeatLoader size={10} color="#e11d48" /> : <><RiLogoutBoxRLine /> Se déconnecter</>}
              </li>
            </ul>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
