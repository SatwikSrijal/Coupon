const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// ✅ Allow frontend to talk to backend
app.use(cors({
  origin: "*",   // allow all origins (you can restrict later to your domain)
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://ecomm:4uiG0jrfXTmRrDBv@cluster0.lif5z0c.mongodb.net/ecommdb", {
 
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Schema & Model
const NumberSchema = new mongoose.Schema({
  date: String,
  time: String,
  value: Number
});

const NumberModel = mongoose.model("Number", NumberSchema);

// ✅ Save or Update Number
app.post("/save", async (req, res) => {
  try {
    const { date, time, value } = req.body;

    if (!date || !time || value === undefined) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let record = await NumberModel.findOne({ date, time });
    if (record) {
      record.value = value;
      await record.save();
      return res.json({ message: "Updated successfully" });
    }

    const newRecord = new NumberModel({ date, time, value });
    await newRecord.save();
    res.json({ message: "Saved successfully" });

  } catch (err) {
    console.error("Error in /save:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get Records for a Date
app.get("/get/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const records = await NumberModel.find({ date }).sort({ time: 1 });
    res.json(records);
  } catch (err) {
    console.error("Error in /get:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
