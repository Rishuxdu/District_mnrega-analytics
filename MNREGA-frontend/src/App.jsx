import React, { useState } from "react";
import axios from "axios";
import './App.css'

export default function App() {
  const [year, setYear] = useState("");
  const [district, setDistrict] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [month, setMonth] = useState("");
const [availableMonths, setAvailableMonths] = useState([]);


  const years = [
    "2020-2021",
    "2021-2022",
    "2022-2023",
    "2023-2024",
    "2024-2025",
  ];

const formatNumber = (num) => {
  if (num == null || num === "") return "N/A";
  const n = Number(num);
  if (isNaN(n)) return num;

  if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`;       
  if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(2)} Lakh`;     
  return `₹ ${n.toLocaleString("en-IN")}`;                   
};


  const handleSearch = async () => {
    if (!year) return alert("Please select a financial year!");
    setLoading(true);
    setSearched(true);

    try {
      // fetch and then get data
      await axios.get(`https://districtmnrega-analytics-production.up.railway.app/fetch?year=${year}`);
      const res = await axios.get(`https://districtmnrega-analytics-production.up.railway.app/data?year=${year}`);
      let records = res.data.records || [];

      if (district.trim()) {
        records = records.filter((r) =>
          r.district_name
            ?.toLowerCase()
            .includes(district.trim().toLowerCase())
        );
      }

        if (month.trim()) {
    records = records.filter((r) =>
      r.month?.toLowerCase() === month.trim().toLowerCase()
    );
  }

  const monthsForYear = [...new Set(records.map((r) => r.month).filter(Boolean))];
setAvailableMonths(monthsForYear.sort())

      setData(records);
    }


    
    catch (err) {
      console.error(err);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-b from-purple-100 via-white to-purple-200 flex flex-col items-center py-10 px-4">
      <h3 className="text-4xl  text-purple-500 mb-6  lg:text-8xl sm:text-purple-400">
        Uttar Pradesh Growth Insights
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 w-full max-w-3xl">

          <input
          type="text"
          placeholder="Search district..."
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full md:w-1/3 p-3 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
        />


        <select
          className="w-full md:w-1/3 p-3 border border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Select Financial Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

   <select
  className="w-full md:w-1/3 p-3  focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700 border border-blue-200  shadow-sm rounded-2xl"
  value={month}
  onChange={(e) => setMonth(e.target.value)}
  disabled={!availableMonths.length}
>
  <option value="">Select Month</option>
  {availableMonths.length > 0
    ? availableMonths.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))
    : [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ].map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
</select>



        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-40  bg-purple-700 text-purple-500 md:w-1/3   font-semibold py-3 px-6  transition-all duration-200     shadow-sm rounded-4xl"
        >
          {loading ? "Loading..." : "Search"}
        </button>
          
  </div> 
 <div className="w-full max-w-4xl">
  {searched && (
    <>
      {loading ? (
        <p className="text-gray-600 text-center mt-4">Fetching data...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-600 text-center mt-4">
          No records found for the selected filters.
        </p>
      ) : (
        (() => {
         
          const uniqueMap = data.reduce((acc, item) => {
            const name = (item.district_name || "Unknown").trim();
            acc[name] = item;
            return acc;
          }, {});
          const uniqueRecords = Object.values(uniqueMap);

          
          const districtQuery = district?.trim().toLowerCase();
          const selected =
            districtQuery && districtQuery.length > 0
              ? uniqueRecords.find((r) =>
                  (r.district_name || "").toLowerCase().includes(districtQuery)
                ) || null
              : uniqueRecords[0] || null;

          if (!selected) {
            return (
              <p className="text-gray-600 text-center mt-4">
                No district matched your search.
              </p>
            );
          }

          
          return (
            <div className="mx-auto mt-6">
              <div className="border border-purple-700 bg-purple-50 shadow-sm rounded-2xl p-6 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-purple-800 mb-1">
                      {selected.district_name || "N/A"}
                    </h2>
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-medium">Financial Year:</span>{" "}
                      {selected.fin_year?.trim() || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Approved Labour Budget</div>
                    <div className="text-lg font-medium text-purple-700">
                      {formatNumber(selected.Approved_Labour_Budget)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Total Expenditure</div>
                    <div className="text-lg font-medium text-purple-700">
                      {(selected.Total_Exp)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Wages</div>
                    <div className="text-lg font-medium text-purple-700">
                      {(selected.Wages)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Avg. Wage Rate (per day)</div>
                    <div className="text-lg font-medium text-purple-700">
                      {formatNumber(selected.Average_Wage_rate_per_day_per_person)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Avg. Days of Employment / HouseHold</div>
                    <div className="text-lg font-medium text-purple-700">
                      {selected.Average_days_of_employment_provided_per_Household || "N/A"}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-xs text-gray-500">Women Persondays</div>
                    <div className="text-lg font-medium text-purple-700">
                      {(selected.Women_Persondays)}
                    </div>
                  </div>
                </div>

                {/* optional metadata row */}
                <div className="mt-4 text-xs text-gray-500">
                  Month: {selected.month || "N/A"} • State Code: {selected.state_code || "N/A"}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </>
  )}
</div>



</div>
     
  );
}










