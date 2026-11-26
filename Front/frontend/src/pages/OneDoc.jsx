import  { useContext, useEffect, useState } from 'react'
import axiosRequest from '../axiosClient/axiosClient'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Oval } from 'react-loader-spinner'
import { userContext } from '../components/ContextWrapper'


function OneDoc() {
    const [radio, setRadio] = useState("service")
    const [formData, setFormData] =useState({})
    const {user}= useContext(userContext)
    const [token] = useState(localStorage.getItem('ACCESS_TOKEN')) //le token d'access
    const {id_doc} = useParams() //id du courrier dans le parametre du lien
    const [isLoading, setIsLoading] = useState(false)
    const [doc, setDoc] = useState({})
        const [dir, setDir] = useState([])
    
    const [servLoading, setServLoading] = useState(false)
    const [servs, setServs] = useState([])
    const [propr, setPropr] = useState({})
  const [waiting, setWaiting] = useState(false)
    const navigate = useNavigate()

        
    const getDir = async () => {
      setWaiting(true);
      try{
          await axiosRequest
              .get("/dir", {
                headers: { "Access-Control-Allow-Origin": "http://127.0.0.1:8000" },
              })
              .then(({ data }) => setDir(data))
              .then(() => setWaiting(false))
              .catch((err) => console.log(err).finally(() => setWaiting(false)));
      }catch(err){
        toast.error("Verifiez votre connexion internet")
      }
   
    };

    const getServs = async () => {
        setServLoading(true)
        try{
                  await axiosRequest.get(`services/${user.id_dir}`, {headers:{Authorization:`Bearer ${token}`, "Access-Control-Allow-Origin":"http://127.0.0.1:8000"}})
        .then(({data}) => setServs(data))
        .then(() => setServLoading(false))
        .catch((err) => toast.error(err.response?.data?.message))
        .finally(() => setServLoading(false))

        }catch(err){
          toast.error("Verifiez votre connexion internet")
        }

    }
    //recupere un courrier par son :id
    const getOneDoc = async () => {
        setIsLoading(true)
        try{
          await axiosRequest.get(`/docByDirection/${id_doc}`, {headers:{Authorization:`Bearer ${token}`, "Access-Control-Allow-Origin":"http://127.0.0.1:8000"}})
            .then(({data}) => setDoc(data))
            .then(() => setIsLoading(false))
            .catch(({response}) => toast.error(response.data?.message))
            .finally(() => setIsLoading(false))
        }catch(err){
          toast.error("Verifiez votre connexion internet connexion")
        }    
    }

    
    
    
    //appel de getOneDoc
    useEffect(() => {
        getOneDoc()
    }, [])
    
    //appel de getServs : attendre que l'utilisateur (et son id_dir) soit chargé
    useEffect(() => {
        if (!user?.id_dir) return
        getServs()
    }, [user?.id_dir])

    //les directions ne dépendent pas de l'utilisateur
    useEffect(() => {
        getDir()
    }, [])
    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData((formData) => ({...formData, [name]:value}))
        if(radio=='service'){
          setFormData((formData) => ({...formData, ['id_dg']:"none"}))
        }else{
          setFormData((formData) => ({...formData, ['serv_id']:"none"}))

        }
    }

    const handleChangePropr = (e) => {
        const {name, value} = e.target
        setPropr((propr) => ({...propr, [name]:value}))
    }
    const submit =async (e) => {
        e.preventDefault()

        if(!user?.id || !user?.id_dir){
          toast.error("Votre profil n'est pas encore chargé, veuillez réessayer")
          return
        }
        if(!doc?.chrono){
          toast.error("Courrier introuvable")
          return
        }
        if(!formData.type){
          toast.error("Veuillez choisir le type de mouvement")
          return
        }

        // Un seul des deux champs cible est renseigné ; l'autre vaut "none".
        const servId = formData.serv_id || "none"
        const dgId = formData.id_dg || "none"

        if(formData.type === 'transfert' && servId === "none" && dgId === "none"){
          toast.error("Veuillez choisir un service ou une direction")
          return
        }

        // Le Chrono est obligatoire côté backend : on retombe sur la référence
        // du courrier s'il n'a pas été saisi.
        const refPropre = String(formData.ref_propre || doc.chrono).trim()

        const data = {
          ...formData,
          ...(formData.type === 'recuperation' ? propr : {}),
          ref_propre: refPropre,
          serv_id: servId,
          id_dg: dgId,
          courrier_id: id_doc,
          user_id: user.id,
          status: "non reçu",
          current_trans_id: 0,
          description: doc.motif || "",
          transfere: "non",
          current_trans_id_dir: user.id_dir,
          ref_initial: doc.chrono,
        }

        try{
          const { data: response } = await axiosRequest.post('/transDoc', data, {headers:{Authorization:`Bearer ${token}`, "Access-Control-Allow-Origin":"http://127.0.0.1:8000"}})
          toast.success(response.message)
          navigate('/sp')
        }catch(err){
          toast.error(err?.response?.data?.message || "Verifiez votre connexion internet")
        }
    }

  
  
    
   
   
    
  return (
    <>
        {isLoading ? ( <Oval
              visible={true}
              height="30"
              width="30"
              color="blue"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass="absolute left-[48%] lg:left-[57%] z-50"
            />):(

                <>
                     <h3 className="text-slate-900 text-2xl ml-2.5 font-semibold ">
                             Transfert D'un Courrier
                    </h3>
            <form
                onSubmit={submit}
                className="w-[100%]  m-auto  p-10 bg-white rounded-xl shadow mt-5 md:mt-10"
            >
                <div className="mb-5">
          <label
            htmlFor="Proprietaire"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Proprietaire
          </label>
          <input
            type="text"
            disabled
            placeholder={doc?.proprietaire}
            id="Proprietaire"
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="Motif"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Motif
          </label>
          <input
            type="text"
            disabled
            placeholder={doc?.motif}
            id="Motif"
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="Motif"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Caracteristique
          </label>
          <input
            type="text"
            disabled
            placeholder={doc?.caracteristique}
            id="caracteristique"
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="provenance"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Provenance
          </label>
          <input
            type="text"
            disabled
            placeholder={doc?.provenance}
            id="provenance"
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="reference"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Reference
          </label>
          <input
            type="text"
            disabled
            placeholder={doc?.chrono}
            id="reference"

            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        {/* <div className="mb-5">
          <label
            htmlFor="services"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Transferer vers (Service)
          </label>
          {servLoading?(<Oval
              visible={true}
              height="30"
              width="30"
              color="blue"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />):(  <select
            onChange={handleChange}
            className="text-slate-900 w-full p-2 rounded"
            name="serv_id"
                    required={formData.type === 'transfert'}
            id="services"
          >
            <option value="">- Selectionner ici -</option>
            {servs.map((serv, index)=><option key={index} value={serv.s_id}>{serv.nom_serv}</option>)}
          </select>)}  
        </div> */}
        <div className="mb-5">
          <label
            htmlFor="type"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Type de Mouvements
          </label>
       <select
            onChange={handleChange}
            className="text-slate-900 w-full p-2 rounded"
            name="type"
            id="type"
            required
          >
            <option value="">- Selectionner ici -</option>
            <option value="transfert">Transfert</option>
            <option value="recuperation">Recuperation</option>
          </select> 
        </div>
        {formData.type =="recuperation" && <div className="mb-5">
          <label
            htmlFor="par"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Par (la personne qui recupere le courrier)
          </label>
          <input
            type="text"
            value={propr?.propr}
            onChange={handleChangePropr}
            placeholder='Recupereur'
            id="par"
            name='propr'
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
}
              {/* DEBUT RADIO */}
              <div className="mb-5">
          <label
            htmlFor="services"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Transferer vers (Service ou Direction)
          </label>
          {/* {servLoading?(<Oval
              visible={true}
              height="30"
              width="30"
              color="blue"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />):(  <select
            onChange={handleChange}
            className="text-slate-900 w-full p-2 rounded"
            name="serv_id"
                    required={formData.type === 'transfert'}
            id="services"
          >
            <option value="">- Selectionner ici -</option>
            {servs.map((serv, index)=><option key={index} value={serv.s_id}>{serv.nom_serv}</option>)}
          </select>)}   */}
          <div className="flex gap-x-5">
                      <label className="block mb-2 text-sm font-medium text-slate-900" htmlFor="service">Service</label>
          <input type="radio" name="cible" id="service" checked={radio=='service'?true:false} value={'service'} onChange={(e) => setRadio(e.target.value)}/>
          <label className="block mb-2 text-sm font-medium text-slate-900" htmlFor="direction">Direction(SP)</label>
          <input type="radio" name="cible" id="direction" checked={radio=='direction'?true:false} value={'direction'} onChange={(e) => setRadio(e.target.value)}/>
          </div>

        </div>
        {/* FIN RADIO */}
        {radio =='service'?(<div className="mb-5">
                  <label
                    htmlFor="services"
                    className="block mb-2 text-sm font-medium text-slate-900"
                  >
                    Transferer vers ({radio})
                  </label>
                  {servLoading?(<Oval
                      visible={true}
                      height="30"
                      width="30"
                      color="blue"
                      ariaLabel="oval-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />):(  <select
                    onChange={handleChange}
                    className="text-slate-900 w-full p-2 rounded"
                    name="serv_id"
                    required={formData.type === 'transfert'}
                    id="services"
                  >
                    <option value="">- Selectionner ici -</option>
                    {servs.map((serv, index)=><option key={index} value={serv.s_id}>{serv.nom_serv}</option>)}
                  </select>)}  
                </div>):(<div className="mb-5">
                  <label
                    htmlFor="dg"
                    className="block mb-2 text-sm font-medium text-slate-900"
                  >
                    Transferer vers ({radio})
                  </label>
                  {waiting?(<Oval
                      visible={true}
                      height="30"
                      width="30"
                      color="blue"
                      ariaLabel="oval-loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />):(  <select
                    onChange={handleChange}
                    className="text-slate-900 w-full p-2 rounded"
                    name="id_dg"
                    required={formData.type === 'transfert'}
                    id="dg"
                  >
                    <option value="">- Selectionner ici -</option>
                    {dir.map((d, index)=><option key={index} value={d.d_id}>{d.nom_dir}</option>)}
                  </select>)}  
                </div>)}
        <div className="mb-5">
          <label
            htmlFor="Chrono"
            className="block mb-2 text-sm font-medium text-slate-900"
          >
            Chrono
          </label>
          <input
            type="text"
            value={formData?.ref_propre ?? ""}
            onChange={handleChange}
            placeholder='Chronologie'
            id="Chrono"
            name='ref_propre'
            className="bg-gray-50 border border-slate-300 text-slate-900 text-sm rounded-2xl focus:ring-brand-400  focus:border-brand-500 block w-full p-2.5  "
          />
        </div>
        <button className='bg-brand-900 px-3 py-2 rounded-xl' type='submit'>Transferer</button>
            </form>
                </>

            )}
    </>
  )
}

export default OneDoc