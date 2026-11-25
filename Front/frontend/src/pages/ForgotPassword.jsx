import { FaArrowLeft, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { Link } from "react-router-dom";
import axiosRequest from "../axiosClient/axiosClient";

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail((email) => ({ ...email, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosRequest
        .post("/forgotPassword", email)
        .then(({ data }) => toast.success(data.message))
        .catch((err) => toast.error(err?.response?.data?.message || "Erreur"))
        .finally(() => setIsLoading(false));
    } catch (err) {
      toast.error("Verifiez votre connexion internet");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-hero">
      <div className="blob bg-brand-500 w-72 h-72 top-[-10%] left-[-5%]" />
      <div className="blob bg-accent-500 w-96 h-96 bottom-[-15%] right-[-10%]" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md mx-4 my-8 card-modern p-8 sm:p-10 animate-scale-in">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <FaShieldAlt className="text-brand-600 text-xl" />
          <span className="font-bold text-brand-900">e-Parapheur</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-modern" htmlFor="email">Email</label>
            <div className="relative">
              <input
                id="email"
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="votre.email@exemple.com"
                className="input-modern pr-11"
              />
              <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4" disabled={isLoading}>
            {isLoading ? <BeatLoader color="#fff" size={10} /> : "Envoyer le lien"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
            <FaArrowLeft className="text-xs" /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
