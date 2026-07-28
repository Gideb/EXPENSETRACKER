const Income = require("../models/Income");
const Expense = require("../models/Expense");
const User = require("../models/User");

const generatePDF = require("../utils/generatePDF");


const exportPDF = async (req, res) => {

  try {

    const userId = req.user.id;


    /**
     * Get user information
     */
    const user = await User.findById(userId)
      .select("name email");

    /**
     * Fetch financial records
     */
    const incomes = await Income.find({
      userId,
    });


    const expenses = await Expense.find({
      userId,
    });


    /* Calculate totals  */
    const totalIncome = incomes.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );


    const totalExpense = expenses.reduce(
      (sum, item) =>
        sum + item.amount,
      0
    );


    const balance =  totalIncome - totalExpense;



    /* Report period
      * Currently:
     * All available records
     *
     * Later you can replace
     * this with custom dates
     */
    const dates = [
      ...incomes.map(item => item.date),
      ...expenses.map(item => item.date)
    ]
    .filter(Boolean)
    .sort(
      (a,b)=> new Date(a)-new Date(b)
    );


    const period = {


      start:
        dates.length
        ?
        dates[0]
        :
        new Date(),


      end:
        dates.length  ?  dates[dates.length - 1]  :   new Date()

    };


    /*Generate PDF */
    await generatePDF(
      res,
      {
        title:
          "Financial Report",

        companyName:
          "Gideb Finance",

        user:{
          name:user.name,
          email:user.email

        },

        period,


        summary:{
          income:
            totalIncome,
          expense:
            totalExpense,
          balance

        },

        incomes,
        expenses,
        transactions:[
          ...incomes.map(item=>({
            date:item.date,
            type:"Income",
            description:item.description,
            amount:item.amount

          })),

          ...expenses.map(item=>({
            date:item.date,
            type:"Expense",
            description:item.description,
            amount:item.amount

          }))
        ]

      }
    );


  }


  catch(err){

    console.error(
      "PDF Export Error:",
      err
    );

    res.status(500).json({
      message:
        err.message
    });
  }

};


module.exports = {  exportPDF,};