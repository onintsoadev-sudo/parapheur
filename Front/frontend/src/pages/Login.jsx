import { FaKey, FaEnvelope, FaEye, FaEyeSlash, FaShieldAlt, FaUsers, FaTimes, FaUserCheck } from "react-icons/fa";
import { userContext } from "../components/ContextWrapper";
import { useContext, useEffect, useRef, useState } from "react";
import axiosRequest from "../axiosClient/axiosClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BeatLoader } from "react-spinners";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { setUser, user } = useContext(userContext);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigate();
  const [formData, setFormData] = useState({});
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [showPassword, setShowPassword] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [accounts, setAccounts] = useState(null);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const checkeds = useRef(null);
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getUser = async () => {
    try {
      await axiosRequest
        .get("/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(({ data }) => {
          if (!data.message) {
            setUser(data);
            if (data.role == "scc") {
              navigation("/scc");
            }
            if (data.role == "sp") {
              navigation("/sp");
            }
            if (data.role == "agent") {
              navigation("/agent");
            }
            if (data.role == "admin") {
              navigation("/admin");
            }
          }
        })
        .catch(() => {});
    } catch (err) {
      toast.error("Verifiez votre connexion internet");
    }
  };

  useEffect(() => {
    getUser();
  }, [localStorage.getItem("ACCESS_TOKEN")]);

  useEffect(() => {
    if (userData !== null) {
      setUser(userData.user);
      localStorage.setItem("ACCESS_TOKEN", userData.token);
      if (userData.user.role == "scc") {
        navigation("/scc");
      } else if (userData.user.role == "admin") {
        navigation("/admin");
      } else if (userData.user.role == "sp") {
        navigation("/sp");
      } else if (userData.user.role == "agent") {
        navigation("/agent");
      }
    }
  }, [userData]);

  useEffect(() => {
    if (localStorage.getItem("ACCESS_TOKEN") !== null) {
      if (user.role == "scc") {
        navigation("/scc");
      }
      if (user.role == "sp") {
        navigation("/sp");
      }
      if (user.role == "admin") {
        navigation("/admin");
      }
      if (user.role == "agent") {
        navigation("/agent");
      }
    }
  }, [user]);

  const openAccounts = async () => {
    setShowAccounts(true);
    if (accounts) return;
    setAccountsLoading(true);
    try {
      const { data } = await axiosRequest.get("/accounts");
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Impossible de charger la liste des comptes");
      setShowAccounts(false);
    } finally {
      setAccountsLoading(false);
    }
  };

  const useAccount = (account) => {
    setFormData({ email: account.email, password: account.password || "" });
    setShowPassword(Boolean(account.password));
    setShowAccounts(false);
    toast.info(`Identifiants de ${account.email} pre-remplis`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await axiosRequest
        .post("/login", formData)
        .then(({ data }) => setUserData(data))
        .then(() => setIsLoading(false))
        .catch((err) => toast.error(err.response?.data?.message || "Erreur de connexion"))
        .finally(() => setIsLoading(false));
    } catch (err) {
      toast.error("Verifiez votre connexion internet");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-hero">
      {/* Animated blobs */}
      <div className="blob bg-brand-500 w-72 h-72 top-[-10%] left-[-5%] animation-delay-2000" />
      <div className="blob bg-accent-500 w-96 h-96 bottom-[-15%] right-[-10%]" style={{ animationDelay: "2s" }} />
      <div className="blob bg-brand-400 w-64 h-64 top-[40%] right-[20%]" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 w-full max-w-5xl mx-4 my-8 grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-brand-950/40 animate-scale-in">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <FaShieldAlt className="text-accent-400 text-xl" />
              </div>
              <span className="font-bold text-xl tracking-tight">e-Parapheur</span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-4 animate-fade-up">
              Gestion intelligente<br />de vos courriers
            </h2>
            <p className="text-brand-200 text-sm leading-relaxed max-w-sm animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Plateforme sécurisée du Ministère du Travail, de l'Emploi et de la Fonction Publique pour le suivi et le traçage des documents officiels.
            </p>
          </div>
          <div className="relative z-10 mt-12">
            <img
              src="/login.png"
              alt="Illustration"
              className="w-4/5 mx-auto drop-shadow-2xl animate-float"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <p className="relative z-10 text-xs text-brand-300 mt-6">
            © {new Date().getFullYear()} MTEFP — Tous droits réservés
          </p>
        </div>

        {/* Right panel - form */}
        <div className="bg-white p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <FaShieldAlt className="text-brand-600 text-2xl" />
            <span className="font-bold text-xl text-brand-900">e-Parapheur</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 animate-fade-down">
            Connexion
          </h1>
          <p className="text-slate-500 text-sm mb-8 animate-fade-down" style={{ animationDelay: "0.05s" }}>
            Entrez vos identifiants pour accéder à votre espace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div>
              <label className="label-modern" htmlFor="email">Email</label>
              <div className="relative">
                <input
                  id="email"
                  onChange={handleChange}
                  value={formData.email || ""}
                  type="text"
                  name="email"
                  placeholder="votre.email@exemple.com"
                  className="input-modern pr-11"
                  autoComplete="email"
                />
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div>
              <label className="label-modern" htmlFor="password">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  onChange={handleChange}
                  value={formData.password || ""}
                  type={showPassword ? "text" : "password"}
                  ref={checkeds}
                  name="password"
                  placeholder="••••••••"
                  className="input-modern pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  onChange={togglePassword}
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={showPassword}
                />
                Afficher le mot de passe
              </label>
              <Link to="/forgotPassword" className="text-brand-600 font-medium hover:text-brand-700 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-base" disabled={isLoading}>
              {isLoading ? <BeatLoader color="#fff" size={10} /> : "Se connecter"}
            </button>
          </form>

          <button
            type="button"
            onClick={openAccounts}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <FaUsers size={15} /> Voir les comptes de démonstration
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/" className="text-brand-600 font-medium hover:underline">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>

      {/* Modal : liste des comptes */}
      {showAccounts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Comptes de démonstration</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {accountsLoading ? "Chargement…" : `${accounts ? accounts.length : 0} compte(s) en base`} — cliquez sur un compte pour pré-remplir le formulaire.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAccounts(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Fermer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {accountsLoading && <p className="text-center text-sm text-slate-500 py-6">Chargement des comptes…</p>}

              {!accountsLoading && accounts && accounts.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-6">Aucun compte trouvé.</p>
              )}

              {!accountsLoading && accounts && accounts.length > 0 && (
                <ul className="space-y-2">
                  {accounts.map((account) => (
                    <li key={account.id}>
                      <button
                        type="button"
                        onClick={() => useAccount(account)}
                        className="w-full text-left rounded-xl border border-slate-200 hover:border-brand-400 hover:bg-brand-50/60 transition-colors px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-800 text-sm break-all">{account.email}</span>
                          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide rounded-full bg-brand-100 text-brand-700 px-2.5 py-1">
                            {account.role}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Mot de passe :</span>
                          <code className="font-mono text-slate-800 bg-slate-100 rounded px-1.5 py-0.5">
                            {account.password || "défini par l'utilisateur"}
                          </code>
                          {account.status !== "active" && (
                            <span className="text-red-600 font-semibold">compte {account.status}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-brand-600 font-medium">
                            <FaUserCheck size={11} /> utiliser
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
