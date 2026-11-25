import React, { useEffect, useState } from "react";
import { FaEye, FaHandHoldingHeart, FaHandsHelping, FaTools, FaArrowRight, FaSearch, FaShieldAlt, FaBolt } from "react-icons/fa";
import { MdOutlineDangerous } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { Link } from "react-router-dom";
import axiosRequest from "../axiosClient/axiosClient";
import { Oval } from "react-loader-spinner";
import { toast } from "react-toastify";

function Home() {
  const [visitors, setVisitors] = useState();
  const [loading, setLoading] = useState(false);

  const getNbrVisitors = async () => {
    setLoading(true);
    try {
      await axiosRequest
        .get("/visitors")
        .then(({ data }) => setVisitors(data))
        .then(() => setLoading(false))
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch (err) {
      toast.error("Verifiez votre connexion internet");
    }
  };

  useEffect(() => {
    getNbrVisitors();
  }, []);

  const features = [
    {
      icon: <FaSearch className="text-2xl" />,
      title: "Traçabilité",
      desc: "Suivez chaque courrier en temps réel, de la réception à la livraison.",
      color: "from-brand-500 to-brand-700",
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Sécurité",
      desc: "Accès contrôlé par rôles. Vos documents officiels restent protégés.",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      icon: <FaBolt className="text-2xl" />,
      title: "Rapidité",
      desc: "Transferts instantanés entre directions et services, sans paperasse.",
      color: "from-accent-500 to-accent-600",
    },
    {
      icon: <FaHandsHelping className="text-2xl" />,
      title: "Collaboration",
      desc: "SCC, SP et agents travaillent ensemble sur une plateforme unique.",
      color: "from-violet-500 to-purple-700",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="blob bg-brand-400 w-80 h-80 top-20 -left-20 opacity-30" />
        <div className="blob bg-accent-500 w-96 h-96 bottom-10 right-0 opacity-20" style={{ animationDelay: "3s" }} />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-brand-100 mb-6 animate-fade-down">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ministère du Travail · Emploi · Fonction Publique
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 animate-fade-up">
                e-Parapheur
              </h1>
              <p className="text-lg sm:text-xl text-brand-100/90 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                Plateforme web de gestion et de suivi des courriers, dédiée au ministère afin de simplifier la gestion et le traçage des documents.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.2s" }}>
                <Link to="/login" className="btn-primary !px-8 !py-4 text-base">
                  Se connecter <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/mydoc" className="btn-secondary !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                  Mon dossier
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-3 justify-center lg:justify-start text-sm text-brand-200 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <FaEye className="text-accent-400" />
                {loading ? (
                  <Oval height={18} width={18} color="#fbbf24" secondaryColor="#6366f1" />
                ) : (
                  <span>
                    <strong className="text-white text-lg">{visitors ?? "—"}</strong> visiteurs
                  </span>
                )}
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-slide-in-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-accent-500 rounded-3xl blur-2xl opacity-30 animate-pulse-soft" />
                <img
                  src="/hero.png"
                  alt="e-Parapheur"
                  className="relative w-full max-w-md rounded-2xl shadow-2xl animate-float"
                  onError={(e) => {
                    e.target.src = "/login.png";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="infos" className="py-20 bg-surface-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="page-title mb-3">Pourquoi e-Parapheur ?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Une solution moderne pour digitaliser le circuit des courriers administratifs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((f, i) => (
              <div key={i} className="card-modern p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values / infos legacy content simplified */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <MdOutlineDangerous size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Zéro perte</h3>
                <p className="text-sm text-slate-500">Plus de courriers égarés. Chaque document a un historique complet.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <FaTools size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Outils adaptés</h3>
                <p className="text-sm text-slate-500">Tableaux de bord, statistiques et alertes selon votre rôle.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <TbWorld size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Accessible</h3>
                <p className="text-sm text-slate-500">Disponible depuis n'importe quel navigateur, sur ordinateur ou mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-brand text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Prêt à digitaliser vos courriers ?</h2>
          <p className="text-brand-100 mb-8 max-w-lg mx-auto">Connectez-vous à votre espace pour enregistrer, transférer et suivre vos documents.</p>
          <Link to="/login" className="btn-accent !px-10 !py-4">
            Accéder à la plateforme
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-300 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-accent-400" />
            <span className="font-semibold text-white">e-Parapheur</span>
          </div>
          <p>© {new Date().getFullYear()} Ministère du Travail, de l'Emploi et de la Fonction Publique</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
