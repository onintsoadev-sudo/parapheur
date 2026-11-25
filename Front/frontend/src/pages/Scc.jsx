import { useContext, useEffect, useState } from "react";
import Aside from "../components/Aside";
import { Link, Outlet } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { userContext } from "../components/ContextWrapper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Security from "../security/Security";
import axiosRequest from "../axiosClient/axiosClient";
import MatchRoleSCC from "../security/MatchRoleSCC";
import { BeatLoader } from "react-spinners";
import { RiLogoutBoxRLine, RiUserLine } from "react-icons/ri";

function Scc() {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const { user, setUser } = useContext(userContext);
  const [dropMenu, setDropMenu] = useState(false);

  const toggleDropMenu = () => setDropMenu(!dropMenu);

  const getUser = async () => {
    try {
      await axiosRequest
        .get("/user", { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setUser(data))
        .catch(() => {});
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);

  const logout = async () => {
    setIsLoading(true);
    try {
      await axiosRequest.post("/logout");
      localStorage.removeItem("ACCESS_TOKEN");
      setIsLoading(false);
      window.location.href = "/login";
    } catch (err) {
      toast.error("Verifiez connexion internet");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.role !== undefined) {
      toast.success(`Vous êtes connecté en tant que ${user?.role}`);
    }
  }, [user.role]);

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="flex min-h-screen">
        <Aside user={user} toggleMenu={toggleMenu} menu={showMenu} />
        <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleMenu} className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700">
                <BiMenu size={24} />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Espace SCC</p>
                <h2 className="text-sm font-semibold text-slate-800">
                  {user.role === "scc" ? "Service Courrier Central" : user.nom_serv || "SCC"}
                </h2>
              </div>
            </div>
            <div className="relative">
              <button type="button" onClick={toggleDropMenu} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-brand-300 transition-all">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white text-xs font-bold flex items-center justify-center">
                  {(user?.name || "S").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name}</span>
              </button>
              {dropMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropMenu(false)} />
                  <ul className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-card animate-fade-down">
                    <Link to="/scc/profil" onClick={() => setDropMenu(false)}>
                      <li className="flex items-center gap-2 cursor-pointer text-slate-700 text-sm rounded-lg px-3 py-2.5 hover:bg-slate-50">
                        <RiUserLine /> Compte
                      </li>
                    </Link>
                    <li onClick={logout} className="flex items-center gap-2 cursor-pointer text-rose-600 text-sm rounded-lg px-3 py-2.5 hover:bg-rose-50">
                      {isLoading ? <BeatLoader size={10} color="#e11d48" /> : <><RiLogoutBoxRLine /> Se déconnecter</>}
                    </li>
                  </ul>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Security>
              <MatchRoleSCC>
                <Outlet />
              </MatchRoleSCC>
            </Security>
          </main>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" toastClassName="!rounded-xl" />
    </div>
  );
}

export default Scc;
