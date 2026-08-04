const PDFDocument = require('pdfkit-table');
const path = require('path');

const COLORS = {
  primary: '#9c521e',
  secondary: '#1E40AF',

  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',

  light: '#F3F4F6',
  dark: '#202b52',
  muted: '#6B7280',

  white: '#FFFFFF',
  amber: '#cc5500',
};

//CURRENCY FORMATTER
const formatCurrency = (amount) => {
  return `GH₵ ${Number(amount || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

//Prevent undefined errors
const safeText = (value) => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
};

// Draw section title
const drawSectionTitle = (doc, title) => {
  doc.fontSize(15).fillColor(COLORS.primary).font('Helvetica-Bold').text(title);

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .strokeColor(COLORS.primary)
    .lineWidth(1)
    .stroke();

  doc.moveDown();
};

//////////////////////////////////////////////////////
// HEADER SECTION
//////////////////////////////////////////////////////

const drawHeader = (
  doc,
  { title = 'Expense Tracker Report', logo = null, companyName = '' } = {}
) => {
  const pageWidth = doc.page.width;

  // Header background
  doc.rect(0, 0, pageWidth, 90).fill(COLORS.primary);

  //  logo
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
  doc.fillColor(COLORS.dark).moveDown(2);
};

//////////////////////////////////////////////////////
// FOOTER SECTION
//////////////////////////////////////////////////////

/* const addFooter = (doc) => {
  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const oldX = doc.x;
    const oldY = doc.y;
    doc.save();

    doc.fontSize(9);

    doc.fillColor('#666');

    doc.text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 30, {
      width: doc.page.width,
      align: 'center',
      lineBreak: false,
    });

    doc.restore();
  }
};
 */
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

    .text(`Prepared For: ${safeText(user.name)}`)

    .text(`Email: ${safeText(user.email)}`)

    .text(`Period: ${formatDate(period.start)} - ${formatDate(period.end)}`)

    .text(`Generated: ${formatDate(new Date())}`);

  doc.moveDown(2);
};

//////////////////////////////////////////////////////
// TABLE GENERATOR
//////////////////////////////////////////////////////

const createTable = async (doc, { title, headers, rows }) => {
  // Reset position
  doc.x = doc.page.margins.left;

  drawSectionTitle(doc, title);

  // Reset again because drawSectionTitle() changes the cursor
  doc.x = doc.page.margins.left;

  try {
    await doc.table(
      { headers, rows },
      {
        x: doc.page.margins.left,
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,

        columnsSize: [90, 90, 200, 100],

        padding: 5,
        columnSpacing: 5,

        prepareHeader: () => {
          doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.amber);
        },

        prepareRow: (row, indexColumn, indexRow) => {
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(indexRow % 2 === 0 ? COLORS.dark : COLORS.muted);
        },

        divider: {
          header: { disabled: false, width: 1 },
          horizontal: { disabled: false, width: 0.4 },
        },

        headerBackground: COLORS.amber,
      }
    );
  } catch (err) {
    console.error(err);
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
    safeText('Income'),
    safeText(income.source),
    formatCurrency(income.amount),
  ]);
};

//Expense table formatter
const formatExpenseRows = (expenses = []) => {
  return expenses.map((expense) => [
    formatDate(expense.date),
    safeText('Expense'),
    safeText(expense.category),
    formatCurrency(expense.amount),
  ]);
};

// Transaction table formatter
const formatTransactionRows = (transactions = []) => {
  return transactions.map((transaction) => [
    formatDate(transaction.date),
    safeText(transaction.type),
    safeText(transaction.category),
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
    logo: data.profileImageUrl || null,
    companyName: data.companyName || 'My Report',
  });

  // USER INFORMATION
  drawUserInformation(doc, data.user || {}, data.period || {});

  //////////////////////////////////////////////////////
  // SUMMARY SECTION
  //////////////////////////////////////////////////////

  drawSectionTitle(doc, 'Report Summary');

  const summary = data.summary || {};

  const cards = [];

  if (summary.income !== undefined) {
    cards.push({
      title: 'Total Income',
      amount: formatCurrency(summary.income),
      color: COLORS.dark,
    });
  }

  if (summary.expense !== undefined) {
    cards.push({
      title: 'Total Expense',
      amount: formatCurrency(summary.expense),
      color: COLORS.dark,
    });
  }

  if (summary.balance !== undefined) {
    cards.push({
      title: 'Balance',
      amount: formatCurrency(summary.balance),
      color: COLORS.dark,
    });
  }

  let cardX = 50;
  const cardY = doc.y;

  cards.forEach((card) => {
    drawSummaryCard(doc, {
      x: cardX,
      y: cardY,
      title: card.title,
      amount: card.amount,
      color: card.color,
    });

    cardX += 170;
  });

  // Move cursor below cards
  doc.y = cardY + 95;
  doc.moveDown();

  //////////////////////////////////////////////////////
  // REPORT TABLES
  //////////////////////////////////////////////////////

  if (data.reportType === 'income') {
    if (data.incomes?.length) {
      await createTable(doc, {
        title: 'Income Records',
        headers: ['Date', 'Type', 'Source', 'Amount'],
        rows: formatIncomeRows(data.incomes),
      });
    }
  }

  if (data.reportType === 'expense') {
    if (data.expenses?.length) {
      await createTable(doc, {
        title: 'Expense Records',
        headers: ['Date', 'Type', 'Category', 'Amount'],
        rows: formatExpenseRows(data.expenses),
      });
    }
  }

  if (data.reportType === 'transaction') {
    if (data.transactions?.length) {
      await createTable(doc, {
        title: 'Transaction History',
        headers: ['Date', 'Type', 'Category/Source', 'Amount'],
        rows: data.transactions.map((item) => [
          formatDate(item.date),
          safeText(item.type),
          safeText(item.category),
          formatCurrency(item.amount),
        ]),
      });
    }
  }

  if (data.reportType === 'financial') {
    if (data.incomes?.length) {
      await createTable(doc, {
        title: 'Income Records',
        headers: ['Date', 'Type', 'Source', 'Amount'],
        rows: formatIncomeRows(data.incomes),
      });
    }

    if (data.expenses?.length) {
      await createTable(doc, {
        title: 'Expense Records',
        headers: ['Date', 'Type', 'Category', 'Amount'],
        rows: formatExpenseRows(data.expenses),
      });
    }
  }

  //addFooter(doc);

  doc.end();
};

module.exports = generatePDF;
