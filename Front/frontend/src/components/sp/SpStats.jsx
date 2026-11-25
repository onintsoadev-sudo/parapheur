import { useEffect, useState } from 'react';
import axiosRequest from '../../axiosClient/axiosClient'; 
import { FaFilter } from 'react-icons/fa6';
import { CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, ResponsiveContainer, BarChart, Bar, Pie, Cell } from 'recharts';

import { SiPaperswithcode } from 'react-icons/si';
import { HiOfficeBuilding } from 'react-icons/hi';

function SpStats() {
  const [docByService, setDocByService] = useState([]);
  const [token] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [period, setPeriod] = useState({ start: "", end: "" });
  const [countByDirection, setCountByDirection] = useState(0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
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

  const handlePeriod = (e) => {
    const { name, value } = e.target;
    setPeriod((period) => ({ ...period, [name]: value }));
  };

  const handleSubmitPeriod = (e) => {
    e.preventDefault();
    getDocByService();
    getcountDocByDirection();
  };

  const getDocByService = async () => {
    await axiosRequest
      .post("/stats/countByService", period, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setDocByService(Array.isArray(data) ? data : []))
      .catch((err) => console.log(err));
  };

  const getcountDocByDirection = async () => {
    await axiosRequest
      .post("/stats/countDocByDirection", period, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "http://127.0.0.1:8000",
        },
      })
      .then(({ data }) => setCountByDirection(data))
      .catch((err) => console.log(err));
  };

  const colors = ["blue", "green", "purple", "yellow", "violet", "red"];

  useEffect(() => {
    getDocByService();
    getcountDocByDirection();
  }, []);

  const data = [];
  (docByService || []).forEach((doc, index) => {
    if (doc) {
      data.push({
        name: doc[0],
        Courriers: doc[1]?.length || 0,
        fill: colors[index % colors.length],
      });
    }
  });

  return (
    <>
      <div className="flex w-full gap-4 items-center justify-between">
        <h3 className="text-slate-700 text-xl text-left ml-2.5 font-semibold">
          Reporting
        </h3>

        <form onSubmit={handleSubmitPeriod} className="w-200px gap-x-2 flex justify-evenly items-center text-slate-700 mr-2">
          <label htmlFor="start" className="text-slate-700 font-medium">Début</label>
          <input type="date" onChange={handlePeriod} name="start" id="start" className="py-2 px-3 rounded-xl shadow" />
          
          <label htmlFor="end" className="text-slate-700 font-medium">Fin</label>
          <input type="date" onChange={handlePeriod} name="end" id="end" className="py-2 px-3 rounded-xl shadow" />

          <button type="submit" className="py-2 px-3 bg-brand-600 rounded-2xl hover:bg-brand-500 text-white">
            <FaFilter className="mr-2 inline" /> Filtrer
          </button>
        </form>
      </div>

      <div className="flex flex-wrap mt-5 px-2 justify-center">
        <div className="mt-2 flex flex-wrap justify-center items-center gap-4">
          <a href="#" className="flex h-20 w-40 flex-col items-center justify-center bg-white shadow-card border border-slate-100-lg rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80">
            <div className="flex flex-row items-center justify-center">
              <SiPaperswithcode className="mr-3 text-brand-600" />
              <span className="font-bold text-slate-600"> {countByDirection} </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">Total Courriers</div>
          </a>

          {(docByService || []).map((d, index) => (
            <a key={index} href="#" className="flex h-20 w-40 bg-white shadow-card border border-slate-100-lg flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 transition-colors duration-100 ease-in-out hover:border-gray-400/80">
              <div className="flex flex-row items-center justify-center">
                <HiOfficeBuilding className="mr-3 text-brand-600" />
                <span className="font-bold text-slate-600"> {d[1]?.length || 0} </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">Direction {d[0]}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap lg:flex-nowrap w-full justify-center gap-5 px-10">
        <div className="w-full bg-white p-5 rounded-2xl py-2 flex flex-col justify-center h-[300px] mt-10 shadow-card">
          <h2 className="text-slate-700 mb-2 mt-2">Graphique Bâton - Flux de Courriers par Direction</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={20}
            >
              <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="Courriers" fill="blue" radius={5} background={{ fill: '#eee' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full bg-white p-5 rounded-2xl py-2 flex flex-col justify-center h-[300px] mt-10 shadow-card">
          <h2 className="text-slate-700 mb-2 mt-2">Graphique Radial - Flux de Courriers par Direction</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="Courriers"
              >
                {data.map((entry, index) => (
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

export default SpStats;