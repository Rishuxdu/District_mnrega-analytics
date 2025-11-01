import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "https://strong-queijadas-d2ec9e.netlify.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

const dataSchema = new mongoose.Schema(
  {
    fin_year: String,
    state_name: String,
    district_name: String
  },
  { strict: false }
);
dataSchema.index({ fin_year: 1, district_name: 1 }, { unique: true });
const Data = mongoose.model("Data", dataSchema);

app.get("/fetch", async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: "Financial year is required" });

    const url = `https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=${process.env.API_KEY}&format=json&offset=0&limit=100&filters%5Bstate_name%5D=UTTAR%20PRADESH&filters%5Bfin_year%5D=${year}`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data.records || data.records.length === 0)
      return res.json({ success: true, message: "No records found" });

    const recordsWithYear = data.records.map(r => ({
      ...r,
      fin_year: year
    }));

    const bulkOps = recordsWithYear.map(r => ({
      updateOne: {
        filter: { fin_year: r.fin_year, district_name: r.district_name },
        update: { $set: r },
        upsert: true
      }
    }));

    await Data.bulkWrite(bulkOps);
    res.json({ success: true, count: recordsWithYear.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/data", async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: "Financial year is required" });

    const records = await Data.find({ fin_year: year });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);




