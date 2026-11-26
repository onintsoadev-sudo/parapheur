import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { SiPaperswithcode, SiPinboard, SiUpcloud } from "react-icons/si";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axiosRequest from "../axiosClient/axiosClient";
import { BsClock } from "react-icons/bs";
import { HiOfficeBuilding } from "react-icons/hi";

function Stats() {
  const [doc, setDoc] = useState([]);
  const [date, setDate] = useState([]);
  const [notLivred, setNotLivred] = useState([]);
  const [notLivredByPeriod, setNotLivredByPeriod] = useState([]);
  const [livred, setLivred] = useState([]);
  const [livredByPeriod, setLivredByPeriod] = useState([]);
  const [docByDirection, setDocByDirection] = useState([]);
  const [docByDirectionByPeriod, setDocByDirectionByPeriod] = useState([]);
  const [token] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [currentDate, setCurrentDate] = useState("");
  const [period, setPeriod] = useState({ start: "", end: "" });
  const [docByPeriod, setDocByPeriod] = useState([]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const style = {
    top: "50%",
    right: 0,
    transform: "translate(0, -50%)",
    lineHeight: "24px",
    color: "blue",
  };

  const data = [];

  // Récupération des données API
  const getDoc = async () => {
    await axiosRequest
      .get("/stats/count", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDoc(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getDate = async () => {
    await axiosRequest
      .get("/stats/date", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDate(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getNotLivred = async () => {
    await axiosRequest
      .get("/stats/notLivred", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setNotLivred(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getNotLivredByPeriod = async () => {
    await axiosRequest
      .post("/stats/notLivredByPeriod", period, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setNotLivredByPeriod(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getDocByDirection = async () => {
    await axiosRequest
      .get("/stats/countByDirection", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocByDirection(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getDocByDirectionByPeriod = async () => {
    await axiosRequest
      .post("/stats/countByDirectionByPeriod", period, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocByDirectionByPeriod(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getLivred = async () => {
    await axiosRequest
      .get("/stats/livred", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setLivred(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getLivredByPeriod = async () => {
    await axiosRequest
      .post("/stats/livredByPeriod", period, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setLivredByPeriod(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const handleChangeDate = (e) => {
    setCurrentDate(e.target.value);
  };

  const getDocByPeriod = async () => {
    try {
      await axiosRequest
        .post("/stats/period", period, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
          },
        })
        .then(({ data }) => setDocByPeriod(Array.isArray(data) ? data : []))
        .catch((err) => console.log(err));
    } catch (err) {
      console.log("Erreur:", err.message);
    }
  };

  useEffect(() => {
    getDoc();
    getDate();
    getNotLivred();
    getLivred();
    getDocByDirection();
    getDocByPeriod();
    getNotLivredByPeriod();
    getLivredByPeriod();
    getDocByDirectionByPeriod();
  }, []);

  const handleSubmitPeriod = (e) => {
    e.preventDefault();
    getDocByPeriod();
    getNotLivredByPeriod();
    getLivredByPeriod();
    getDocByDirectionByPeriod();
  };

  const only = [];
  if (Array.isArray(doc) && doc.length !== 0) {
    doc.forEach((d) => {
      if (d?.created_at) {
        only.push({ created_at: d.created_at.substring(0, 7) });
      }
    });
  }

  // Filtrer les courriers par direction par date
  const docByDirectionByDate = Array.isArray(docByDirection)
    ? docByDirection.map((docs) => {
        const targetMonth = currentDate
          ? currentDate
          : doc[doc.length - 1]?.created_at?.substring(0, 7);

        return [
          docs?.[0],
          docs?.[1]?.filter((dc) => dc?.created_at?.substring(0, 7) === targetMonth) || [],
          docs?.[2] ?? 0,
          docs?.[3] ?? 0,
        ];
      })
    : [];

  // Filtrer les courriers par direction par date par période
  const docByDirectionByDateByPeriod = Array.isArray(docByDirectionByPeriod)
    ? docByDirectionByPeriod.map((docs) => {
        const targetMonth = currentDate
          ? currentDate
          : doc[doc.length - 1]?.created_at?.substring(0, 7);

        return [
          docs?.[0],
          docs?.[1]?.filter((dc) => dc?.created_at?.substring(0, 7) === targetMonth) || [],
          docs?.[2] ?? 0,
          docs?.[3] ?? 0,
        ];
      })
    : [];

  const color = ["blue", "green", "violet", "maroon", "yellow", "purple", "red"];

  // Ajout des données filtrées
  if (only.length !== 0) {
    new Set(only).forEach((dc, index) => {
      let uv = doc.filter((d) => d?.created_at?.substring(0, 7) === dc.created_at).length;
      let pv = doc.filter(
        (d) =>
          d?.created_at?.substring(0, 7) ===
          (currentDate ? currentDate : doc[doc.length - 1]?.created_at?.substring(0, 7))
      ).length;

      data.push({
        name: "courrier",
        courrier: uv,
        mensuel: pv,
        amt: dc.created_at,
        fill: color[index % color.length],
      });
    });
  }

  // Liste des dates non filtrées
  const AMT = [];
  if (Array.isArray(doc)) {
    doc.forEach((dc) => {
      if (dc?.created_at) {
        AMT.push({ amt: dc.created_at.substring(0, 7) });
      }
    });
  }

  // Liste de dates filtrées
  const uniqueAMT = [];
  if (AMT.length > 0) {
    uniqueAMT.push({ amt: AMT[0]?.amt, courrier: 0 });
    let index = 0;
    for (let i = 0; i < AMT.length; i++) {
      if (uniqueAMT[index]?.amt !== AMT[i]?.amt) {
        uniqueAMT.push({ amt: AMT[i]?.amt, courrier: 0 });
        index++;
      }
    }

    // Calcul du nombre de courriers par uniqueAMT
    for (let i = 0; i < uniqueAMT.length; i++) {
      doc.forEach((dc) => {
        if (dc?.created_at?.substring(0, 7) === uniqueAMT[i]?.amt) {
          uniqueAMT[i].courrier += 1;
        }
      });
    }
  }

  const handlePeriod = (e) => {
    const { name, value } = e.target;
    setPeriod((period) => ({ ...period, [name]: value }));
  };

  const dataPeriod = [
    {
      name: "courrier",
      mensuel: Array.isArray(docByPeriod) ? docByPeriod.length : 0,
      courrier: Array.isArray(doc)
        ? doc.filter(
            (d) =>
              d?.created_at?.substring(0, 7) ===
              (currentDate ? currentDate : doc[doc.length - 1]?.created_at?.substring(0, 7))
          ).length
        : 0,
    },
  ];

  const dataDir = [];
  if (Array.isArray(docByDirectionByDateByPeriod)) {
    docByDirectionByDateByPeriod.forEach((docItem, index) => {
      const randomColor = ["blue", "green", "violet", "maroon", "yellow", "purple", "red"];
      const count = Array.isArray(docItem?.[1]) ? docItem[1].length : 0;
      dataDir.push({
        name: docItem?.[0] || `Direction ${index + 1}`,
        Courriers: count,
        fill: randomColor[index % randomColor.length],
      });
    });
  }

  // Calcul sécurisé du nombre total de courriers enregistrés
  let number = 0;
  if (Array.isArray(docByDirectionByPeriod)) {
    docByDirectionByPeriod.forEach((dc) => {
      if (dc && Array.isArray(dc[1])) {
        number += dc[1].length;
      }
    });
  }

  return (
    <>
      <div className="flex w-full gap-4 items-center justify-between">
        <h3 className="text-slate-700 text-xl text-left ml-2.5 font-semibold">
          Reporting
        </h3>

        <form
          onSubmit={handleSubmitPeriod}
          className="w-200px gap-x-2 flex justify-evenly items-center text-slate-700 mr-2"
        >
          <label htmlFor="" className="text-slate-700 font-medium">
            Début
          </label>
          <input
            type="date"
            onChange={handlePeriod}
            name="start"
            className="py-2 px-3 rounded-xl shadow"
          />
          <label htmlFor="" className="text-slate-700 font-medium">
            Fin
          </label>
          <input
            type="date"
            onChange={handlePeriod}
            name="end"
            className="py-2 px-3 rounded-xl shadow"
          />

          <button
            type="submit"
            className="py-2 px-3 bg-brand-600 rounded-2xl hover:bg-brand-500 text-white"
          >
            <FaFilter className="mr-2 inline" /> Filtrer
          </button>
        </form>
      </div>

      <div className="flex flex-wrap mt-5 px-2 justify-center">
        <div className="mt-2 flex flex-wrap justify-center items-center gap-4">
          <a
            href="#"
            className="flex h-20 w-40 flex-col items-center justify-center bg-white shadow-card border border-slate-100-lg rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80"
          >
            <div className="flex flex-row items-center justify-center">
              <SiPaperswithcode className="mr-3 text-brand-600" />
              <span className="font-bold text-slate-600"> {doc?.length || 0} </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Total Courriers</div>
          </a>

          <a
            href="#"
            className="flex h-20 w-40 bg-white shadow-card border border-slate-100-lg flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80"
          >
            <div className="flex flex-row items-center justify-center">
              <SiUpcloud className="text-cyan-500 mr-3" size={24} />
              <span className="font-bold text-slate-600"> {number} </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Courriers Enregistrés</div>
          </a>

          <a
            href="#"
            className="flex h-20 w-40 bg-white shadow-card border border-slate-100-lg flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80"
          >
            <div className="flex flex-row items-center justify-center">
              <BsClock className="mr-3 text-orange-500" />
              <span className="font-bold text-slate-600">
                {" "}
                {notLivredByPeriod?.length || 0}{" "}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">En attente</div>
          </a>

          <a
            href="#"
            className="flex h-20 w-40 bg-white shadow-card border border-slate-100-lg flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80"
          >
            <div className="flex flex-row items-center justify-center">
              <SiPinboard className="mr-3 text-green-500" />
              <span className="font-bold text-slate-600">
                {" "}
                {Array.isArray(livredByPeriod)
                  ? livredByPeriod.filter(
                      (lv) =>
                        lv?.created_at?.substring(0, 7) ===
                        (currentDate ? currentDate : lv?.created_at?.substring(0, 7))
                    ).length
                  : 0}{" "}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Courriers Livrés</div>
          </a>

          {docByDirectionByDateByPeriod.map((d, index) => (
            <a
              key={index}
              href="#"
              className="flex h-20 w-40 bg-white shadow-card border border-slate-100-lg flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80"
            >
              <div className="flex flex-row items-center justify-center">
                <HiOfficeBuilding
                  className={`mr-3 text-${color[index % color.length]}-500`}
                />
                <span className="font-bold text-slate-600">
                  {" "}
                  {d[1]?.length || 0}
                  {"/"}
                  <span className="text-green-500">
                    {Array.isArray(d[2]) ? d[2].length : d[2] || 0}
                  </span>
                  {"/"}
                  <span className="text-red-500">
                    {Array.isArray(d[3]) ? d[3].length : d[3] || 0}
                  </span>
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">Direction {d[0]}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap lg:flex-nowrap w-full justify-center gap-5 px-10">
        <div className="w-full bg-white p-5 rounded-2xl py-2 flex flex-col justify-center h-[300px] mt-10 shadow-card">
          <h2 className="text-slate-700 mb-2 mt-2">
            Graphique Radial - Flux de Courriers par Direction
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={dataDir}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={20}
            >
              <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar
                dataKey="Courriers"
                fill="blue"
                radius={5}
                background={{ fill: "#eee" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full bg-white p-5 rounded-2xl py-2 flex flex-col justify-center h-[300px] mt-10 shadow-card">
          <h2 className="text-slate-700 mb-2 mt-2">
            Graphique Radial - Flux de Courriers par Direction
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={dataDir}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="Courriers"
              >
                {dataDir.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || "#8884d8"} />
                ))}
              </Pie>
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={style}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default Stats;