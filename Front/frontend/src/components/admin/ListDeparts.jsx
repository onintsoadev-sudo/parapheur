import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axiosRequest from "../../axiosClient/axiosClient";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function ListDeparts() {
  const [activeTab, setActiveTab] = useState("dg");
  const [data, setData] = useState({ services: [], directions: [], dg: [] });
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState();

  const [refresh, setRefresh] = useState(false);
  const portes = useRef();
  const noms = useRef();

  // Récupère les trois niveaux de l'organisation depuis le backend
  const getMixte = async () => {
    try {
      const [dgRes, dirRes, servRes] = await Promise.all([
        axiosRequest.get("/dg"),
        axiosRequest.get("/dir"),
        axiosRequest.get("/serv"),
      ]);
      setData({
        dg: Array.isArray(dgRes.data) ? dgRes.data : [],
        directions: Array.isArray(dirRes.data) ? dirRes.data : [],
        services: Array.isArray(servRes.data) ? servRes.data : [],
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Impossible de charger les départements"
      );
    }
  };

  useEffect(() => {
    getMixte();
  }, [refresh]);

  const currentData = data[activeTab] || [];

  const getTabLabel = () => {
    switch (activeTab) {
      case "services":
        return "Service";
      case "directions":
        return "Direction";
      case "dg":
        return "Direction Générale";
      default:
        return "";
    }
  };

  const getItemId = (item) =>
    item?.dg_id ?? item?.d_id ?? item?.s_id;

  const handleEditClick = (item) => {
    setEditData(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
  };

  const submitData = async (e) => {
    e.preventDefault();
    const id = getItemId(editData);
    if (!id) return;

    let endpoint;
    let payload;
    if (activeTab === "dg") {
      endpoint = `/dg/${id}`;
      payload = { nom_dg: noms.current?.value };
    } else if (activeTab === "directions") {
      endpoint = `/dir/${id}`;
      payload = {
        nom_dir: noms.current?.value,
        porte_dir: portes.current?.value,
      };
    } else {
      endpoint = `/serv/${id}`;
      payload = {
        nom_serv: noms.current?.value,
        porte_serv: portes.current?.value,
      };
    }

    try {
      await axiosRequest.put(endpoint, payload);
      toast.success(`${getTabLabel()} modifiée avec succès`);
      closeModal();
      setRefresh((value) => !value);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const deletes = async (id) => {
    if (!id) return;
    const endpoint =
      activeTab === "dg"
        ? `/dg/${id}`
        : activeTab === "directions"
        ? `/dir/${id}`
        : `/serv/${id}`;

    try {
      await axiosRequest.delete(endpoint);
      toast.success(`${getTabLabel()} supprimée avec succès`);
      setRefresh((value) => !value);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  return (
    <>
      <section className="w-full px-4 mx-auto mt-4">
        {/* Onglets */}
        <div className="flex gap-4 mb-6">
          {["dg", "directions", "services"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                activeTab === tab
                  ? "bg-brand-500 text-white"
                  : "bg-surface-50 text-slate-700 hover:bg-gray-200"
              }`}
            >
              {tab === "dg"
                ? "Direction Générale"
                : tab === "directions"
                ? "Directions"
                : "services"}
            </button>
          ))}
        </div>

        {/* Bouton Ajouter */}
        <div className="flex justify-end mb-4">
          <Link
            to={"/admin/sccservdirdg"}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-2xl hover:bg-brand-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Ajouter {getTabLabel()}
          </Link>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-500">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-500">
                  Nom {getTabLabel()}
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-500">Portes</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentData.map((item, index) => (
                <tr key={getItemId(item) ?? index}>
                  <td className="px-6 py-3 text-sm text-slate-700">{index + 1}</td>
                  <td className="px-6 py-3 text-sm text-slate-700">
                    {item.nom_dg ?? item.nom_dir ?? item.nom_serv}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">
                    {item.porte_dir ?? item.porte_serv ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700 space-x-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="inline-flex items-center px-3 py-1 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                    >
                      <FaEdit className="mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => deletes(getItemId(item))}
                      className="inline-flex items-center px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <FaTrash className="mr-1" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-3 text-center text-slate-500">
                    Aucune donnée disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-2xl shadow-card w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Modifier {getTabLabel()}
            </h2>
            <form onSubmit={submitData}>
              {/* Input nom */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom {getTabLabel()}
                </label>
                <input
                  name={
                    activeTab === "dg"
                      ? "nom_dg"
                      : activeTab === "directions"
                      ? "nom_dir"
                      : "nom_serv"
                  }
                  type="text"
                  ref={noms}
                  defaultValue={
                    editData?.nom_serv ?? editData?.nom_dir ?? editData?.nom_dg
                  }
                  className="w-full px-3 py-2 border text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Input porte (si service ou direction) */}
              {(activeTab === "services" || activeTab === "directions") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Porte
                  </label>
                  <input
                    ref={portes}
                    name={activeTab === "directions" ? "porte_dir" : "porte_serv"}
                    type="text"
                    defaultValue={editData?.porte_serv ?? editData?.porte_dir}
                    className="w-full px-3 py-2 text-black border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}

              {/* Boutons */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 mr-2 text-sm text-slate-600 bg-surface-50 rounded hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-brand-500 rounded hover:bg-brand-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ListDeparts;
