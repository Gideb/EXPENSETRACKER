const PDFDocument = require("pdfkit");
const path = require("path");


/**
 * Production Ready PDF Generator
 *
 * Features:
 * - Professional financial report layout
 * - Optional company logo
 * - User information
 * - Summary cards
 * - Income table
 * - Expense table
 * - Transaction history
 * - Zebra striped tables
 * - Automatic page breaks
 * - Repeating table headers
 * - Page numbers
 * - Footer
 */


const COLORS = {
  primary: "#2563EB",
  secondary: "#1E40AF",

  success: "#16A34A",
  danger: "#DC2626",
  warning: "#F59E0B",

  light: "#F3F4F6",
  dark: "#111827",
  muted: "#6B7280",

  white: "#FFFFFF",
};



/**
 * Currency formatter
 */
const formatCurrency = (amount = 0) => {

  return new Intl.NumberFormat(
    process.env.CURRENCY_LOCALE || "en-US",
    {
      style:"currency",
      currency:
        process.env.CURRENCY || "GHS",
    }
  ).format(amount);

};



/**
 * Date formatter
 */
const formatDate = (date) => {

  if (!date) return "-";


  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

};



/**
 * Prevent undefined errors
 */
const safeText = (value) => {

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }


  return String(value);

};



/**
 * Draw section title
 */
const drawSectionTitle = (doc, title) => {


  doc
    .fontSize(15)
    .fillColor(COLORS.primary)
    .font("Helvetica-Bold")
    .text(title);


  doc.moveDown(0.5);

};




//////////////////////////////////////////////////////
// HEADER SECTION
//////////////////////////////////////////////////////

/**
 * Draw professional report header
 */
const drawHeader = (
  doc, {
    title = "Financial Report",
    logo = null,
    companyName = "",
  } = {}
) =>{

  const pageWidth = doc.page.width;


  // Header background
  doc.rect( 0, 0, pageWidth, 90).fill(COLORS.primary);



  // Optional logo
  if (logo) {

    try {

      doc.image( path.resolve(logo), 40, 20,  {
          width: 50,
          height: 50,
        }
      );

    } catch(error) {

      console.log(
        "Unable to load logo:",
        error.message
      );
    }
  }


  // Company name
  if(companyName){

    doc
      .fillColor(COLORS.white)
      .fontSize(12)
      .font("Helvetica")
      .text(
        companyName,
        logo ? 110 : 40,
        20
      );

  }


  // Report title

  doc
    .fillColor(COLORS.white)
    .fontSize(22)
    .font("Helvetica-Bold")
    .text(
      title,
      logo ? 110 : 40,
      42
    );



  // Reset cursor

  doc
    .fillColor(COLORS.dark)
    .moveDown(3);

};





//////////////////////////////////////////////////////
// FOOTER SECTION
//////////////////////////////////////////////////////


/**
 * Add footer with page numbers
 */
const addFooter = (doc) => {


  const range =
    doc.bufferedPageRange();



  for(
    let i = 0;
    i < range.count;
    i++
  ){

    doc.switchToPage(i);



    const footerY =
      doc.page.height - 45;



    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .text(
        `Generated automatically • Page ${i + 1} of ${range.count}`,
        50,
        footerY,
        {
          align:"center",
          width:
          doc.page.width - 100
        }
      );

  }


};







//////////////////////////////////////////////////////
// SUMMARY CARDS
//////////////////////////////////////////////////////


/**
 * Creates dashboard style summary boxes
 */
const drawSummaryCard = (
  doc,
  { x, y, title, amount, color }) =>{

  const width = 160;
  const height = 75;



  // Card background

  doc
    .roundedRect(
      x,
      y,
      width,
      height,
      10
    )
    .fill(color);



  // Title

  doc
    .fillColor(COLORS.white)
    .fontSize(11)
    .font("Helvetica")
    .text(
      title,
      x + 12,
      y + 12
    );



  // Amount

  doc
    .fontSize(17)
    .font("Helvetica-Bold")
    .text(
      amount,
      x + 12,
      y + 38
    );


};



//////////////////////////////////////////////////////
// USER INFORMATION BLOCK
//////////////////////////////////////////////////////


const drawUserInformation = (
  doc,
  user = {},
  period = {}
)=>{


doc
.fontSize(11)
.fillColor(COLORS.dark)

.text(
`Name: ${safeText(user.name)}`
)

.text(
`Email: ${safeText(user.email)}`
)

.text(
`Report Period: ${
period.start
?
formatDate(period.start)
:
"-"
}
-
${
period.end
?
formatDate(period.end)
:
"-"
}`
)

.text(
`Generated:
${formatDate(new Date())}`
);


doc.moveDown();


};


/* part 3 */
//////////////////////////////////////////////////////
// TABLE GENERATOR
//////////////////////////////////////////////////////

/**
 * Creates professional tables
 *
 * Features:
 * - pdfkit-table compatible
 * - repeating headers
 * - zebra rows
 * - automatic page breaks
 * - clean formatting
 */


const createTable = async (
  doc,
  {
    title,
    headers,
    rows,
  }
)=>{


  drawSectionTitle(
    doc,
    title
  );



  await doc.table(

    {
      headers,

      rows,

    },

    {


      width:
        doc.page.width - 100,



      prepareHeader: () => {


        doc
          .font(
            "Helvetica-Bold"
          )

          .fontSize(10)

          .fillColor(
            COLORS.white
          );

      },



      prepareRow: (
        row,
        indexColumn,
        indexRow
      )=>{


        doc
          .font(
            "Helvetica"
          )

          .fontSize(9);



        /**
         * Zebra striping
         */

        if(indexRow % 2 === 0){

          doc.fillColor(
            COLORS.dark
          );

        }
        else{

          doc.fillColor(
            COLORS.muted
          );

        }

      },



      divider: {

        header:

        {
          disabled:false,
          width:1,
          opacity:0.7
        },


        horizontal:

        {
          disabled:false,
          width:0.5,
          opacity:0.3
        }

      },



      padding:8,


      columnSpacing:5,


    }

  );



  doc.moveDown();

};








//////////////////////////////////////////////////////
// TABLE FORMATTERS
//////////////////////////////////////////////////////



/**
 * Income table formatter
 */

const formatIncomeRows = (
  incomes=[]
)=>{


  return incomes.map(
    (income)=>[


      formatDate(
        income.date
      ),


      safeText(
        income.category
      ),


      safeText(
        income.description
      ),


      formatCurrency(
        income.amount
      )

    ]

  );

};







/**
 * Expense table formatter
 */

const formatExpenseRows = (
  expenses=[]
)=>{


  return expenses.map(
    (expense)=>[


      formatDate(
        expense.date
      ),


      safeText(
        expense.category
      ),


      safeText(
        expense.description
      ),


      formatCurrency(
        expense.amount
      )


    ]

  );


};







/**
 * Transaction table formatter
 */

const formatTransactionRows = (
  transactions=[]
)=>{


  return transactions.map(
    (transaction)=>[


      formatDate(
        transaction.date
      ),


      safeText(
        transaction.type
      ),


      safeText(
        transaction.description
      ),


      formatCurrency(
        transaction.amount
      )


    ]

  );


};







//////////////////////////////////////////////////////
// EMPTY STATE HANDLER
//////////////////////////////////////////////////////


const drawEmptyMessage = (
  doc,
  message
)=>{


  doc
    .fontSize(11)
    .fillColor(
      COLORS.muted
    )
    .font(
      "Helvetica-Oblique"
    )
    .text(
      message
    );


  doc.moveDown();

};


/* part 4 */

//////////////////////////////////////////////////////
// MAIN PDF GENERATOR FUNCTION
//////////////////////////////////////////////////////


const generatePDF = async (
  res,
  data = {}
) => {


  /**
   * Create PDF document
   */

  const doc = new PDFDocument({

    size: "A4",

    margin:50,

    bufferPages:true,

    autoFirstPage:true,

  });



  /**
   * Response headers
   */

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );


  res.setHeader(
    "Content-Disposition",
    "attachment; filename=financial-report.pdf"
  );



  /**
   * Pipe PDF directly to browser
   */

  doc.pipe(res);






  //////////////////////////////////////////////////////
  // HEADER
  //////////////////////////////////////////////////////


  drawHeader(
    doc,
    {

      title:
        data.title ||
        "Financial Report",


      logo:
        data.logo ||
        null,


      companyName:
        data.companyName ||
        ""

    }
  );


  //////////////////////////////////////////////////////
  // USER INFORMATION
  //////////////////////////////////////////////////////


 drawUserInformation(
    doc,
    data.user || {},
    data.period || {}
);

  //////////////////////////////////////////////////////
  // SUMMARY SECTION
  //////////////////////////////////////////////////////

  drawSectionTitle(
    doc,
    "Financial Summary"
  );

  const summary =
    data.summary || {};

  const currentY =
    doc.y;

  drawSummaryCard(
    doc,
    {

      x:50,
      y:currentY,

      title:
        "Total Income",

      amount:
        formatCurrency(
          summary.income || 0
        ),

      color:
        COLORS.success

    }
  );





  drawSummaryCard(
    doc,
    {
      x:220,

      y:currentY,

      title:
        "Total Expense",


      amount:
        formatCurrency(
          summary.expense || 0
        ),


      color:
        COLORS.danger

    }
  );






  drawSummaryCard(
    doc,
    {

      x:390,

      y:currentY,


      title:
        "Balance",


      amount:
        formatCurrency(
          summary.balance || 0
        ),


      color:
        COLORS.primary

    }
  );





  doc.moveDown(6);










  //////////////////////////////////////////////////////
  // INCOME TABLE
  //////////////////////////////////////////////////////



  if(
    data.incomes &&
    data.incomes.length > 0
  ){


    await createTable(

      doc,

      {

        title:
          "Income Records",


        headers:
        [
          "Date",
          "Category",
          "Description",
          "Amount"
        ],


        rows:
          formatIncomeRows(
            data.incomes
          )

      }

    );


  }
  else{


    drawEmptyMessage(
      doc,
      "No income records available."
    );


  }










  //////////////////////////////////////////////////////
  // EXPENSE TABLE
  //////////////////////////////////////////////////////


  if(

    data.expenses &&
    data.expenses.length > 0

  ){



    await createTable(

      doc,

      {


        title:
          "Expense Records",


        headers:

        [

          "Date",

          "Category",

          "Description",

          "Amount"

        ],



        rows:

          formatExpenseRows(
            data.expenses
          )


      }

    );


  }
  else{


    drawEmptyMessage(
      doc,
      "No expense records available."
    );


  }









  //////////////////////////////////////////////////////
  // TRANSACTIONS TABLE
  //////////////////////////////////////////////////////



  if(

    data.transactions &&
    data.transactions.length > 0

  ){



    await createTable(

      doc,


      {


        title:
          "Transaction History",



        headers:

        [

          "Date",

          "Type",

          "Description",

          "Amount"

        ],



        rows:

          formatTransactionRows(
            data.transactions
          )


      }

    );


  }
  else{


    drawEmptyMessage(
      doc,
      "No transactions found."
    );


  }









  //////////////////////////////////////////////////////
  // FOOTER + PAGE NUMBERS
  //////////////////////////////////////////////////////


  addFooter(doc);








  //////////////////////////////////////////////////////
  // FINISH PDF
  //////////////////////////////////////////////////////


  doc.end();


};


/* part 5 */

//////////////////////////////////////////////////////
// EXPORT FUNCTION
//////////////////////////////////////////////////////


module.exports = generatePDF;