const PDFDocument = require("pdfkit");

const generatePDF = (res, data) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Expense_Report.pdf"
  );

  doc.pipe(res);

  doc
    .fontSize(22)
    .text("Expense Tracker Report", {
      align: "center",
    });

  doc.moveDown();

  doc.fontSize(12);

  doc.text(`Generated: ${new Date().toLocaleDateString()}`);

  doc.moveDown();

  doc.text(`Total Income: GH₵${data.totalIncome}`);

  doc.text(`Total Expense: GH₵${data.totalExpense}`);

    doc.text(`Balance: GH₵${data.balance}`);
    
    //after summary
    doc
  .fontSize(16)
  .text("Income");

doc.moveDown();

data.incomes.forEach((income) => {
  doc.text(
    `${income.date.toLocaleDateString()} | ${income.source} | GH₵${income.amount}`
  );
});

doc.moveDown();

  doc.moveDown();


    //expense table

    doc
  .fontSize(16)
  .text("Expenses");

doc.moveDown();

data.expenses.forEach((expense) => {
  doc.text(
    `${expense.date.toLocaleDateString()} | ${expense.category} | GH₵${expense.amount}`
  );
});
    
    doc
  .fontSize(22)
  .fillColor("#2563eb")
  .text("Expense Tracker Report", {
    align: "center",
  });

doc.moveDown(2);

doc.fillColor("black");

doc.fontSize(16).text("Summary");

doc.moveDown(0.5);

doc.font("Helvetica-Bold");
doc.text(`Total Income: GH₵${data.totalIncome}`);

doc.text(`Total Expense: GH₵${data.totalExpense}`);

doc.text(`Balance: GH₵${data.balance}`);

    doc.font("Helvetica");
    
    
  doc.end();
};

module.exports = generatePDF;