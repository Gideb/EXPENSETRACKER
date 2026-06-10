const Income = require("../models/Income");
const xlsx = require("xlsx");

//add income source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, date } = req.body;

    // Prevent future dates
    if (new Date(date) > new Date()) {
      return res.status(400).json({
        message: "Future dates are not allowed",
      });
    }

    //validation: check for missing fields
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newIncome = new Income({
      userId,
      icon,
      source,
      amount,
      date: new Date(date),
    });

    await newIncome.save();
    res.status(200).json(newIncome);
  } catch (error) {
    console.error("Error adding income:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//update income
exports.updateIncome = async (req, res) => {
  try {
    const updatedIncome = await Income.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      req.body,
      { returnDocument: "after" },
    );

    if (!updatedIncome) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    res.status(200).json(updatedIncome);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//get income source
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//delete income source
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findByIdAndDelete(id);

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Error deleting income:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//download excel
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 }).lean();

    if (incomes.length === 0) {
      return res.status(400).json({ message: "No incomes to download" });
    }

    const data = incomes.map((income) => ({
      Source: income.source,
      Amount: income.amount,
      Date: income.date
        ? new Date(income.date).toISOString().split("T")[0]
        : "",
      Icon: income.icon || "",
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Income");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.status(200).send(buffer);
  } catch (error) {
    console.error("Error downloading excel:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
