
const PDFDocument = require('pdfkit-table');
const path = require('path');

const COLORS = {
  primary: '#cc5500',
  secondary: '#1E40AF',

  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',

  light: '#F3F4F6',
  dark: '#111827',
  muted: '#6B7280',

  white: '#FFFFFF',
};

//CURRENCY FORMATTER
const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    currencyDisplay: 'symbol',
  }).format(amount);
};

//DATE FORMATTER
const formatDate = (date) => {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Prevent undefined errors
 */
const safeText = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
};

/**
 * Draw section title
 */
const drawSectionTitle = (doc, title) => {
  doc.fontSize(15).fillColor(COLORS.primary).font('Helvetica-Bold').text(title);

  doc.moveDown(0.5);
};

//////////////////////////////////////////////////////
// HEADER SECTION
//////////////////////////////////////////////////////

const drawHeader = (doc, { title = 'Financial Report', logo = null, companyName = '' } = {}) => {
  const pageWidth = doc.page.width;

  // Header background
  doc.rect(0, 0, pageWidth, 90).fill(COLORS.primary);

  // Optional logo
  if (logo) {
    try {
      doc.image(path.resolve(logo), 40, 20, {
        width: 50,
        height: 50,
      });
    } catch (error) {
      console.log('Unable to load logo:', error.message);
    }
  }

  // Company name
  if (companyName) {
    doc
      .fillColor(COLORS.white)
      .fontSize(12)
      .font('Helvetica')
      .text(companyName, logo ? 110 : 40, 20);
  }

  // Report title

  doc
    .fillColor(COLORS.white)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(title, logo ? 110 : 40, 42);

  // Reset cursor

  doc.fillColor(COLORS.dark).moveDown(3);
};

//////////////////////////////////////////////////////
// FOOTER SECTION
//////////////////////////////////////////////////////

const addFooter = (doc) => {
  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);

    const footerY = doc.page.height - 45;

    doc
      .fontSize(6)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .text(`Page ${i + 1} of ${range.count}`, 50, footerY, {
        align: 'center',
        width: doc.page.width - 100,
      });
  }
};

//////////////////////////////////////////////////////
// SUMMARY CARDS
//////////////////////////////////////////////////////

const drawSummaryCard = (doc, { x, y, title, amount, color }) => {
  const width = 160;
  const height = 75;

  // Card background
  doc.roundedRect(x, y, width, height, 7).fill(color);

  // Title
  doc
    .fillColor(COLORS.white)
    .fontSize(10)
    .font('Helvetica')
    .text(title, x + 10, y + 10);

  // Amount
  doc
    .fontSize(15)
    .font('Helvetica-Bold')
    .text(amount, x + 12, y + 35);
};

//////////////////////////////////////////////////////
// USER INFORMATION BLOCK
//////////////////////////////////////////////////////

const drawUserInformation = (doc, user = {}, period = {}) => {
  doc
    .fontSize(11)
    .fillColor(COLORS.dark)
    .text(`Name: ${safeText(user?.fullName)}`)
    .text(`Email: ${safeText(user?.email)}`)
    .text(
      `Report Period: ${period.start ? formatDate(period.start) : '-'} - ${period.end ? formatDate(period.end) : '-'}`
    )
    .text(`Generated:${formatDate(new Date())}`);

  doc.moveDown();
};

//////////////////////////////////////////////////////
// TABLE GENERATOR
//////////////////////////////////////////////////////

const createTable = async (doc, { title, headers, rows }) => {
  drawSectionTitle(doc, title);

  console.log('TABLE:', title);
  console.log('HEADERS:', headers);
  console.log('ROWS:', rows);
  console.log('ROW COUNT:', rows.length);

 try {
   await doc.table(
     { headers, rows },
     {
       width: doc.page.width - 100,
       prepareHeader: () => {
         doc.font('Helvetica-Bold').fontSize(10);
       },
     }
   );

   console.log('TABLE FINISHED');
 } catch (err) {
   console.error('TABLE ERROR:', err);
 }
  doc.moveDown();
};

//////////////////////////////////////////////////////
// TABLE FORMATTERS
//////////////////////////////////////////////////////

// Income table formatter
const formatIncomeRows = (incomes = []) => {
  return incomes.map((income) => [
    formatDate(income.date),
    safeText(income.category),
    safeText(income.description),
    formatCurrency(income.amount),
  ]);
};

//Expense table formatter
const formatExpenseRows = (expenses = []) => {
  return expenses.map((expense) => [
    formatDate(expense.date),
    safeText(expense.category),
    safeText(expense.description),
    formatCurrency(expense.amount),
  ]);
};

// Transaction table formatter
const formatTransactionRows = (transactions = []) => {
  return transactions.map((transaction) => [
    formatDate(transaction.date),
    safeText(transaction.type),
    safeText(transaction.category),
    safeText(transaction.description),
    formatCurrency(transaction.amount),
  ]);
};

const drawEmptyMessage = (doc, message) => {
  doc.fontSize(11).fillColor(COLORS.muted).font('Helvetica-Oblique').text(message);

  doc.moveDown();
};

//////////////////////////////////////////////////////
// MAIN PDF GENERATOR FUNCTION
//////////////////////////////////////////////////////

const generatePDF = async (res, data = {}) => {
 
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    autoFirstPage: true,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${data.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
  );

  doc.pipe(res);

  //////////////////////////////////////////////////////
  // HEADER
  //////////////////////////////////////////////////////

  drawHeader(doc, {
    title: data.title || 'Financial Report',
    logo: data.logo || null,
    companyName: data.fullName || '',
  });

  // USER INFORMATION
  drawUserInformation(doc, data.user || {}, data.period || {});

  //////////////////////////////////////////////////////
  // SUMMARY SECTION
  //////////////////////////////////////////////////////

  drawSectionTitle(doc, 'Financial Summary');

  const summary = data.summary || {};

  const cards = [];

  if (summary.income !== undefined) {
    cards.push({
      title: 'Total Income',
      amount: formatCurrency(summary.income),
      color: COLORS.success,
    });
  }

  if (summary.expense !== undefined) {
    cards.push({
      title: 'Total Expense',
      amount: formatCurrency(summary.expense),
      color: COLORS.danger,
    });
  }

  if (summary.balance !== undefined) {
    cards.push({
      title: 'Balance',
      amount: formatCurrency(summary.balance),
      color: COLORS.primary,
    });
  }

  let cardX = 50;

  cards.forEach((card) => {
    drawSummaryCard(doc, {
      x: cardX,
      y: doc.y,
      title: card.title,
      amount: card.amount,
      color: card.color,
    });

    cardX += 170;
  });

  doc.moveDown(6);

  //////////////////////////////////////////////////////
  // REPORT TABLES
  //////////////////////////////////////////////////////

  if (data.reportType === 'income') {
    if (data.incomes?.length) {
      await createTable(doc, {
        title: 'Income Records',

        headers: ['Date', 'Category', 'Description', 'Amount'],

        rows: formatIncomeRows(data.incomes),
      });
    }
  }

  if (data.reportType === 'expense') {
    if (data.expenses?.length) {
      await createTable(doc, {
        title: 'Expense Records',

        headers: ['Date', 'Category', 'Description', 'Amount'],

        rows: formatExpenseRows(data.expenses),
      });
    }
  }

  if (data.reportType === 'transaction') {
    if (data.transactions?.length) {
      await createTable(doc, {
        title: 'Transaction History',

        headers: ['Date', 'Type', 'Category', 'Description', 'Amount'],

        rows: data.transactions.map((item) => [
          formatDate(item.date),
          safeText(item.type),
          safeText(item.category),
          safeText(item.description),
          formatCurrency(item.amount),
        ]),
      });
    }
  }

  if (data.reportType === 'financial') {
    if (data.incomes?.length) {
      await createTable(doc, {
        title: 'Income Records',
        headers: ['Date', 'Category', 'Description', 'Amount'],
        rows: formatIncomeRows(data.incomes),
      });
    }

    if (data.expenses?.length) {
      await createTable(doc, {
        title: 'Expense Records',
        headers: ['Date', 'Category', 'Description', 'Amount'],
        rows: formatExpenseRows(data.expenses),
      });
    }
  }

  addFooter(doc);

  doc.end();
};

module.exports = generatePDF;
