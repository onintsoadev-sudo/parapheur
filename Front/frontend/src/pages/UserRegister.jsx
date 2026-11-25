import axiosRequest from "../axiosClient/axiosClient";
import { BeatLoader } from "react-spinners";
import { useEffect,  useState } from "react";
import { toast} from "react-toastify";
import { Oval } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";

const EMPTY_FORM = {
  status: 'active',
  name: '',
  email: '',
  im: '',
  id_dir: '',
  id_serv: '',
  role: '',
  password: '',
  password_confirmation: '',
};

function UserRegister() {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [servLoading, setServLoading] = useState(false)
  const [dirs, setDirs] = useState([]); //liste des directions
  const [waiting, setWaiting] = useState(false); // looder pour la recuperation des directions
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));

  
 
 

 
  

  //recupere dynamiquement la liste de services par rapport a la direction
  const getServices = async (idDir) => {
    if (!idDir) {
      setServices([]);
      return;
    }
    setServLoading(true);
    try {
      const { data } = await axiosRequest.get(`/services/${idDir}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(data);
    } catch (err) {
      setServices([]);
      toast.error(err?.response?.data?.message || "Impossible de charger les services");
    } finally {
      setServLoading(false);
    }
  };

    //recuperation de la liste de Direction
    const getDir = async () => {
      setWaiting(true);
  try {
      const { data } = await axiosRequest.get("/dir");
      setDirs(data);
  } catch (err) {
      toast.error(err?.response?.data?.message || "Impossible de charger les directions");
  } finally {
      setWaiting(false);
  }

    };

  useEffect(() => {
    getServices(formData.id_dir);
  }, [formData.id_dir]);

  useEffect(() => {
    getDir()
  }, [])



  const handleChange = (e) => {
    const { name, value } = e.target;

    // Changer de direction invalide le service deja choisi
    setFormData((formData) =>
      name === "id_dir"
        ? { ...formData, id_dir: value, id_serv: "" }
        : { ...formData, [name]: value }
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    // Memes champs obligatoires que le backend : evite un 422 opaque
    if (!formData.name || !formData.email || !formData.im) {
      toast.error("Le nom, l'email et l'immatricule sont obligatoires");
      return;
    }
    if (!formData.id_dir || !formData.id_serv) {
      toast.error("Veuillez selectionner une direction et un service");
      return;
    }
    if (!formData.role) {
      toast.error("Veuillez selectionner un role");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit etre au minimum 8 caracteres");
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axiosRequest.post("/register", formData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(data.message);
      setFormData({ ...EMPTY_FORM });
      setServices([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verifiez votre connexion internet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="w-full flex-grow p-6">
        <div className="leading-loose">
          <form className="p-3 bg-white rounded shadow-xl" onSubmit={submit}>
            <p className="text-lg text-gray-800 font-medium pb-4">
              Creer Un Utilisateur
            </p>
            <div className="">
              <label className="block text-md  text-slate-900" htmlFor="name">
                Nom
              </label>
              <input
                onChange={handleChange}
                value={formData?.name}
                className="w-full px-5 py-1 text-slate-700 border-slate-300 rounded-xl border-2 focus:ring-brand-400 bg-gray-50 "
                id="name"
                name="name"
                type="text"
                required=""
                placeholder="Le Nom Du Nouveau Utilisateur "
                aria-label="Name"
               
              />
            </div>
            <div className="mt-2">
              <label className="block text-md text-slate-900" htmlFor="email">
                Email
              </label>
              <input
                onChange={handleChange}
                value={formData?.email}
                className="w-full px-5  py-1 text-slate-700 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
                name="email"
                type="text"
                required=""
                placeholder="L'Email Du Nouveau Utilisateur"
                id="email"
              />
            </div>
            <div className="mt-2">
              <label className=" block text-md text-slate-900" htmlFor="im">
                I-Matricule
              </label>
              <input
                onChange={handleChange}
                value={formData?.im}
                className="w-full px-2 py-1 text-slate-700 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
                id="im"
                name="im"
                type="text"
                required=""
                placeholder="L'Imatricule Du Nouveau Utilisateur"
              />
            </div>
            <div className="mt-2">
              <label className="text-md block text-slate-900" htmlFor="dir">
                Direction
              </label>
       
              {waiting ? (
            <Oval
              visible={true}
              height="20"
              width="20"
              color="blue"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : (
            <select
              onChange={handleChange}
              value={formData.id_dir}
              className="text-slate-900 w-full p-2 rounded"
              name="id_dir"
              id="dir"
              required
            >
              <option value="">- Selectionner ici -</option>
              {dirs.map((d, index) => (
                <option value={d.d_id} key={index}>
                  {d.nom_dir}
                </option>
              ))}
            </select>
          )}
            </div>
            <div className="mt-2">
              <label className="text-md block text-slate-900" htmlFor="serv">
                Services 
              </label>
            {
              servLoading?(<Oval  visible={true}
                height="20"
                width="20"
                color="blue"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""/>):(       <select
                onChange={handleChange}
                value={formData.id_serv}
                name="id_serv"
                id="serv"
                disabled={!formData.id_dir}
                required
                className="w-full p-3 text-slate-900 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
              >
                <option value=''>
                  {formData.id_dir ? "Selectionner un service" : "Choisissez d'abord une direction"}
                </option>
                {
                    services.map((serv, index) =><option key={index} value={serv.s_id}>{serv.nom_serv}</option>)
                }
              </select>)
            }
       
            </div>

            <div className="mt-2">
              <label
                className="text-md block text-slate-900"
                htmlFor="cus_email"
              >
                Role
              </label>
              <select
                onChange={handleChange}
                value={formData.role}
                name="role"
                required
                className="w-full p-3 text-slate-900 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
              >
                <option value="">- Selectionner ici -</option>
                <option value="admin">Admin</option>
                <option value="scc">SCC</option>
                <option value="sp">Secretaire Particulier</option>
                <option value="agent">Agent Service</option>
              </select>
            </div>
            <div className="inline-block mt-2 w-1/2 pr-1">
              <label className="block text-md text-slate-900" htmlFor="pass">
                Mot de Passe
              </label>
              <input
                onChange={handleChange}
                value={formData?.password}
                className="w-full px-2 py-2 text-slate-700 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
                id="pass"
                name="password"
                type="password"
                required=""
                placeholder="Mot De Passe"
              />
            </div>
            <div className="inline-block mt-2 -mx-1 pl-1 w-1/2">
              <label className=" block text-md text-slate-900" htmlFor="conf">
                Confirmation Mot de passe
              </label>
              <input
                onChange={handleChange}
                value={formData?.password_confirmation}
                className="w-full px-2 py-2 text-slate-700 bg-gray-50 rounded-xl border-slate-300 border-2 focus:ring-brand-400"
                id="conf"
                name="password_confirmation"
                type="password"
                required=""
                placeholder="Confirmation Du Mot De Passe"
              />
            </div>
            <div className="mt-6">
              <button
                className="px-4 py-1 text-white font-light tracking-wider bg-brand-900 rounded-xl"
                type="submit"
              >
                {isLoading ? <BeatLoader color="yellow" /> : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      
      </main>
    </>
  );
}

export default UserRegister;
