import React, { useState } from "react";
import { BiSolidError } from "react-icons/bi";
import { FaEnvelope, FaInfo, FaPaperPlane } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import axiosRequest from "../axiosClient/axiosClient";
import { useNavigate, Link } from "react-router-dom";

function Support() {
  const [formData, setFormData] = useState({});
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const redirect = (link) => navigate(link);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosRequest
        .post("/support", formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => toast.success(data.message))
        .then(() => setIsLoading(false))
        .then(() => setFormData({ email: "", objet: "", message: "" }))
        .catch(({ response }) =>
          toast.error(response?.data?.message || "Erreur d'envoi")
        )
        .finally(() => setIsLoading(false));
    } catch (err) {
      toast.error("Verifiez votre connexion internet");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-surface-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 animate-fade-down">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mb-4">
            <BiSolidError size={28} />
          </div>
          <h1 className="page-title mb-2">Support technique</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Besoin d'aide ou une erreur rencontrée ? Envoyez-nous un message, nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:flex justify-center animate-slide-in-left">
            <img
              src="/support.avif"
              className="w-4/5 max-w-sm drop-shadow-xl"
              alt="Support"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="card-modern p-8 animate-slide-in-right">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label-modern" htmlFor="email">Email</label>
                <div className="relative">
                  <input
                    onChange={handleChange}
                    type="email"
                    value={formData?.email || ""}
                    name="email"
                    id="email"
                    placeholder="votre.email@exemple.com"
                    className="input-modern pr-11"
                  />
                  <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="label-modern" htmlFor="objet">Objet</label>
                <div className="relative">
                  <input
                    onChange={handleChange}
                    type="text"
                    name="objet"
                    id="objet"
                    value={formData?.objet || ""}
                    placeholder="Objet du message"
                    className="input-modern pr-11"
                  />
                  <FaInfo className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="label-modern" htmlFor="message">Message</label>
                <div className="relative">
                  <textarea
                    onChange={handleChange}
                    id="message"
                    name="message"
                    value={formData?.message || ""}
                    placeholder="Décrivez votre problème..."
                    rows={5}
                    className="input-modern pr-11 resize-none"
                  />
                  <FaMessage className="absolute right-4 top-4 text-slate-400" size={16} />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-4" disabled={isLoading}>
                {isLoading ? (
                  <BeatLoader color="#fff" size={10} />
                ) : (
                  <>
                    <FaPaperPlane /> Envoyer
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link to="/" className="text-brand-600 font-medium hover:underline">
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
