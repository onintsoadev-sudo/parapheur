import { useState } from "react";
import { Outlet } from "react-router-dom";
import Aside from "../components/admin/Aside";
import Header from "../components/admin/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminProtection from "../components/admin/AdminProtection";

function Admin() {
  const [show, setShow] = useState(false);

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
