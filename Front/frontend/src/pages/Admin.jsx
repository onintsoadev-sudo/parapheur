import { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../components/admin/Aside";
import Header from "../components/admin/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminProtection from "../components/admin/AdminProtection";
import { userContext } from "../components/ContextWrapper";
import axiosRequest from "../axiosClient/axiosClient";

function Admin() {
  const [show, setShow] = useState(false);
  const { setUser } = useContext(userContext);

  // Au rechargement de la page, le contexte est vide : on recharge l'admin
  // courant pour que AdminProtection/Header disposent de son rôle.
  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) return;
    axiosRequest
      .get("/user", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, [setUser]);

  return (
    <>
      <div className="bg-surface-50 font-sans flex min-h-screen">
        <Aside show={show} setShow={setShow} />
        <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
          <Header show={show} setShow={setShow} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <AdminProtection>
              <Outlet />
            </AdminProtection>
          </main>
        </div>
      </div>
      <ToastContainer position="top-right" theme="colored" toastClassName="!rounded-xl" />
    </>
  );
}

export default Admin;
