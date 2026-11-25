import { useEffect, useId, useState } from "react";
import { FaFilter, FaHandPointDown } from "react-icons/fa";
import { FaHandBackFist, FaHouseFire, FaUserGroup } from "react-icons/fa6";
import axiosRequest from "../axiosClient/axiosClient";
import { AnimatedCounter } from 'react-animated-counter';

import { SiPaperswithcode } from "react-icons/si";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Cell,
  Bar,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [period, setPeriod] = useState({ start: "", end: "" }); // pour le trafic
  const [period2, setPeriod2] = useState({ start: "", end: "" }); // pour les données globales
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [view, setView] = useState(0);
  const [chartDataView, setChartDataView] = useState([]);
  const [staff, setStaff] = useState(0);
  const [docByDirectionByPeriod, setDocByDirectionByPeriod] = useState([]);
  const [currentDate, setCurrentDate] = useState("");

  const [allDoc, setAllDoc] = useState([]);
  const [allDocGotByOwner, setAllDocGotByOwner] = useState([]);
  const [allDocNotGotByOwner, setAllDocNotGotByOwner] = useState([]);
  const [docByDirection, setDocByDirection] = useState([]);
  const [docNumberByServiceNoFilter, setDocNumberByServiceNoFilter] = useState([]);

  const handleSubmitPeriod = (e) => {
    e.preventDefault();
    getNumberOfView();
  };

  const handleSubmitPeriod2 = (e) => {
    e.preventDefault();
    getDocByDirection();
    getDocGotByOwner();
    getDocNotGotByOwner();
    getDocNumberByServiceNoFilter();
    getDocByDirectionByPeriod();
  };

  // Récupération des courriers
  const getDoc = async () => {
    await axiosRequest
      .get("/stats/count", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setAllDoc(data))
      .catch((err) => console.log(err));
  };

  // Récupération des courriers récupérés par leur propriétaire
  const getDocGotByOwner = async () => {
    await axiosRequest
      .post("/stats/gotByOwnerCount", period2, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setAllDocGotByOwner(data))
      .catch((err) => console.log(err));
  };

  // Récupération du nombre de courriers par service sans filtre
  const getDocNumberByServiceNoFilter = async () => {
    await axiosRequest
      .post("/stats/countByServiceNoFilter", period2, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocNumberByServiceNoFilter(data))
      .catch((err) => console.log(err));
  };

  // Récupération des courriers non récupérés par leur propriétaire
  const getDocNotGotByOwner = async () => {
    await axiosRequest
      .post("/stats/notGotByOwnerCount", period2, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setAllDocNotGotByOwner(data))
      .catch((err) => console.log(err));
  };

  // Gère le changement des dates périodiques pour le trafic
  const handlePeriod = (e) => {
    const { name, value } = e.target;
    setPeriod((period) => ({ ...period, [name]: value }));
  };

  // Gère le changement des dates périodiques globales
  const handlePeriod2 = (e) => {
    const { name, value } = e.target;
    setPeriod2((period2) => ({ ...period2, [name]: value }));
  };

  // Récupération du nombre de vues
  const getNumberOfView = async () => {
    try {
      await axiosRequest
        .post("/visitors/period", period, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
          },
        })
        .then(({ data }) => setView(data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  // Récupération des graphiques de trafic
  const getNumberOfViewChart = async () => {
    try {
      await axiosRequest
        .get("/visitors/charts", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
          },
        })
        .then(({ data }) => setChartDataView(data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  // Récupération du nombre de courriers par direction
  const getDocByDirection = async () => {
    await axiosRequest
      .post("/stats/countByDirectionAdmin", period2, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocByDirection(data))
      .catch((err) => console.log(err));
  };

  const getUserCount = async () => {
    try {
      await axiosRequest
        .get("/userCount", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
          },
        })
        .then(({ data }) => setStaff(data))
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  // Récupération de la liste des courriers par direction par période
  const getDocByDirectionByPeriod = async () => {
    await axiosRequest
      .post("/stats/countByDirectionByPeriod", period2, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocByDirectionByPeriod(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getNumberOfView();
    getNumberOfViewChart();
    getDoc();
    getDocGotByOwner();
    getDocNotGotByOwner();
    getDocByDirection();
    getUserCount();
    getDocNumberByServiceNoFilter();
    getDocByDirectionByPeriod();
  }, []);

  const allOfDocByPeriod = Array.isArray(docByDirectionByPeriod) ? [...docByDirectionByPeriod] : [];
  
  let number = 0;
  allOfDocByPeriod.forEach((dc) => {
    if (dc && Array.isArray(dc[1])) {
      dc[1].find(
        (f) =>
          f?.created_at?.substring(0, 7) ===
          (currentDate
            ? currentDate
            : dc[dc.length - 1]?.created_at?.substring(0, 7))
      );
      number += dc[1].length;
    }
  });

  const allOfDocByPeriodService = Array.isArray(docNumberByServiceNoFilter) ? [...docNumberByServiceNoFilter] : [];

  allOfDocByPeriodService.forEach((doc) => {
    if (doc && Array.isArray(doc[1])) {
      doc[1].find(
        (f) =>
          f?.created_at?.substring(0, 7) ===
          (currentDate
            ? currentDate
            : doc[doc.length - 1]?.created_at?.substring(0, 7))
      );
    }
  });

  const getPath = (x, y, width, height) => {
    return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
    ${x + width / 2}, ${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
    Z`;
  };

  const TriangleBar = (props) => {
    const { fill, x, y, width, height } = props;
    return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
  };

  // Filtrer les courriers par direction par date par période
  const docByDirectionByDateByPeriod = (allOfDocByPeriod || []).map((docs) => {
    return [
      docs[0],
      docs[1]?.filter(dc => dc?.created_at?.substring(0, 7) === (currentDate ? currentDate : allDoc[allDoc.length - 1]?.created_at?.substring(0, 7))),
      docs[2]?.filter(dc => dc?.created_at?.substring(0, 7) === (currentDate ? currentDate : allDoc[allDoc.length - 1]?.created_at?.substring(0, 7))),
      docs[3]?.filter(dc => dc?.created_at?.substring(0, 7) === (currentDate ? currentDate : allDoc[allDoc.length - 1]?.created_at?.substring(0, 7)))
    ];
  });

  const dataDir = [];
  docByDirectionByDateByPeriod.forEach((doc, index) => {
    const randomColor = ["blue", "purple", "pink", "red", "green", "yellow"];
    dataDir.push({ name: doc[0], Courriers: doc[1]?.length || 0, fill: randomColor[index % randomColor.length] });
  });

  const dataServ = [];
  allOfDocByPeriodService.forEach((doc, index) => {
    const randomColor = ["blue", "purple", "pink", "red", "green", "yellow"];
    dataServ.push({ name: doc[0], Courriers: doc[1]?.length || 0, fill: randomColor[index % randomColor.length] });
  });

  return (
    <>
      <div className="dash-header">
        <h3 className="page-title text-xl">
          Reporting
        </h3>

        <form
          onSubmit={handleSubmitPeriod2}
          className="w-200px gap-x-2 flex justify-evenly items-center text-slate-700 mr-2"
        >
          <label htmlFor="" className="text-slate-700 font-medium">
            Début
          </label>
          <input
            type="date"
            onChange={handlePeriod2}
            name="start"
            className="py-2 px-3 rounded-xl shadow"
          />
          <label htmlFor="" className="text-slate-700 font-medium">
            Fin
          </label>

          <input
            type="date"
            onChange={handlePeriod2}
            name="end"
            className="py-2 px-3 rounded-xl shadow"
          />

          <button
            type="submit"
            className="btn-primary !py-2 !px-4 !text-sm"
          >
            <FaFilter className="mr-2 inline" /> Filtrer
          </button>
        </form>
      </div>

      <div className="flex flex-wrap mt-5 px-2 justify-center">
        <div className="mt-2 flex flex-wrap justify-center items-center gap-4">
          <a
            href="#"
            className="flex h-20 w-[12rem] flex-col items-center justify-center bg-white shadow-lg rounded-xl border border border-slate-100 shadow-card transition-colors duration-100 ease-in-out hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <div className="flex flex-row items-center justify-center">
              <FaUserGroup className="mr-3 text-yellow-600" />
              <span className="font-bold text-slate-600"> {staff} </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Utilisateurs</div>
          </a>

          <a
            href="#"
            className="flex h-20 w-40 flex-col items-center justify-center bg-white shadow-lg rounded-xl border border border-slate-100 shadow-card transition-colors duration-100 ease-in-out hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <div className="flex flex-row items-center justify-center">
              <SiPaperswithcode className="mr-3 text-brand-600" />
              <span className="font-bold text-slate-600"> {number} </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Total Courriers</div>
          </a>

          {docByDirection.map((doc, index) => (
            <a
              key={index}
              href="#"
              className="flex h-20 w-[12rem] flex-col items-center justify-center bg-white shadow-lg rounded-xl border border border-slate-100 shadow-card transition-colors duration-100 ease-in-out hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="flex flex-row items-center justify-center">
                <FaHouseFire className="mr-3 text-brand-600" />
                <span className="font-bold text-slate-600"> {doc[1]?.length || 0} </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">Direction-{doc[0]}</div>
            </a>
          ))}

          {docNumberByServiceNoFilter.map((doc, index) => (
            <a
              key={index}
              href="#"
              className="flex h-20 w-[12rem] flex-col items-center justify-center bg-white shadow-lg rounded-xl border border border-slate-100 shadow-card transition-colors duration-100 ease-in-out hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="flex flex-row items-center justify-center">
                <FaHouseFire className="mr-3 text-indigo-600" />
                <span className="font-bold text-slate-600"> {doc[1]?.length || 0} </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">Service-{doc[0]}</div>
            </a>
          ))}
        </div>

        <div className="mt-0 flex w-full justify-center gap-5 px-10">
          <div className="w-full bg-white p-5 rounded-lg py-2 flex flex-col justify-center h-[300px] mt-10 shadow-lg">
            <div className="text-slate-700 mb-2 mt-2 flex justify-between items-center">
              <p>Nombre Total de Visites</p>
              <form
                onSubmit={handleSubmitPeriod}
                className="flex mt-2 lg:mt-0 justify-evenly gap-x-5 p-4 md:p-0"
              >
                <input
                  className="p-2 rounded-xl shadow-lg"
                  onChange={handlePeriod}
                  name="start"
                  type="date"
                />
                <input
                  className="p-2 rounded-xl shadow-lg"
                  onChange={handlePeriod}
                  name="end"
                  type="date"
                />
                <button
                  className="bg-brand-900 text-white px-3 h-10 relative rounded-xl"
                  type="submit"
                >
                  Valider
                </button>
              </form>
            </div>
            <div className="w-full flex justify-center h-full border items-center border-slate-200 rounded-xl">
              <h2>
                <AnimatedCounter
                  includeCommas={false}
                  includeDecimals={false}
                  value={Number(view) || 0}
                  fontSize="5rem"
                  digitStyles={{ color: '#7393B3' }}
                />
              </h2>
            </div>
          </div>

          <div className="w-full bg-white p-5 rounded-lg py-2 flex flex-col justify-center h-[300px] mt-10 shadow-lg">
            <h2 className="text-slate-700 mb-2 mt-2">Graphique de Trafic de Visites</h2>
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="w-full flex justify-center bg-blue-200 mx-auto rounded-xl"
            >
              <LineChart width={300} height={500} data={chartDataView}>
                <Line
                  type="monotone"
                  dataKey="nbr"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex w-full justify-center gap-5 px-10">
          <div className="w-full bg-white p-5 rounded-lg py-2 flex flex-col justify-center h-[300px] mt-5 shadow-lg">
            <h2 className="text-slate-700 mb-2 mt-2">Flux de courriers par Direction</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={dataDir}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="Courriers"
                  fill="#8884d8"
                  shape={<TriangleBar />}
                  label={{ position: 'top' }}
                >
                  {dataDir.map((entry, index) => (
                    <Cell key={`cell-dir-${index}`} fill={entry.fill || "#8884d8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full bg-white p-5 rounded-lg py-2 flex flex-col justify-center h-[300px] mt-5 shadow-lg">
            <h2 className="text-slate-700 mb-2 mt-2">Flux de courriers par Service</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={dataServ}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="Courriers"
                  fill="#8884d8"
                  shape={<TriangleBar />}
                  label={{ position: 'top' }}
                >
                  {dataServ.map((entry, index) => (
                    <Cell key={`cell-serv-${index}`} fill={entry.fill || "#8884d8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;