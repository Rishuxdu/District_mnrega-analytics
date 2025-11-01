import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
  state_name: String,
  district_name: String,
  fin_year: String,
  households_worked: Number,
  total_exp: Number,
  wages: Number
});

export default mongoose.model("Data", dataSchema);
