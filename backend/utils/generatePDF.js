const PDFDocument = require('pdfkit');

const PAGE = {
  width: 595.28,
  height: 841.89,
  left: 50,
  right: 545,
  top: 30,
  bottom: 790,
  contentWidth: 495,
};

const COLORS = {
  text: '#1f2937',
  muted: '#6b7280',
  lightMuted: '#9ca3af',
  border: '#e5e7eb',

  tableHeader: '#fffbeb',
  tableHeaderText: '#92400e',

  alternateRow: '#f9fafb',
  white: '#ffffff',

  green: '#16a34a',
  greenLight: '#f0fdf4',

  red: '#dc2626',
  redLight: '#fef2f2',

  blue: '#2563eb',
  blueLight: '#eff6ff',

  yellow: '#ca8a04',
  yellowLight: '#fefce8',

  amber: '#d97706',
  amberLight: '#fffbeb',
  amberBorder: '#fde68a',
  amberDark: '#92400e',

  brown: '#895129',
  brownDark: '#3d251e',
};

const generatePDF = (res, data = {}) => {
  return new Promise((resolve, reject) => {
    let doc;

    try {
      doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        autoFirstPage: true,
      });

      // ============================================================
      // DATA
      // ============================================================

      const reportType = data.reportType || 'financial';

      const incomes = Array.isArray(data.incomes) ? data.incomes : [];
      const expenses = Array.isArray(data.expenses) ? data.expenses : [];
      const transactions = Array.isArray(data.transactions) ? data.transactions : [];

      const budgets = Array.isArray(data.budgets) ? data.budgets : [];
      const goals = Array.isArray(data.goals) ? data.goals : [];

      const summary = data.summary || {};

      // User information
      const user = data.user || {};

      const userName = user.fullName || user.name || data.name || 'User';

      const userEmail = user.email || data.userEmail || data.email || '';

      const startDate = data.startDate || data.period?.start || new Date();

      const endDate = data.endDate || data.period?.end || new Date();

      const totalIncome =
        data.totalIncome ??
        summary.income ??
        incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const totalExpense =
        data.totalExpense ??
        summary.expense ??
        expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const balance = data.balance ?? summary.balance ?? totalIncome - totalExpense;

      const savingsRate =
        summary.savingsRate ??
        (totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0);

      // ============================================================
      // RESPONSE
      // ============================================================

      const fileDate = new Date().toISOString().split('T')[0];

      let filename = 'Expense_Report';

      if (reportType === 'financial') {
        filename = 'Financial_Statement';
      } else if (reportType === 'income') {
        filename = 'Income_Report';
      } else if (reportType === 'expense') {
        filename = 'Expense_Report';
      } else if (reportType === 'transaction') {
        filename = 'Transaction_Report';
      }

      res.setHeader('Content-Type', 'application/pdf');

      res.setHeader('Content-Disposition', `attachment; filename=${filename}_${fileDate}.pdf`);

      doc.pipe(res);

      // ============================================================
      // HELPERS
      // ============================================================

      const formatAmount = (amount) => {
        const value = Number(amount || 0);

        return `GHS ${new Intl.NumberFormat('en-GH', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value)}`;
      };

      const formatDate = (date) => {
        if (!date) return '-';

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
          return '-';
        }

        return parsed.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      };

      const formatPercent = (value) => {
        return `${Number(value || 0).toFixed(2)}%`;
      };

      const truncate = (value, maxLength = 35) => {
        const text = String(value ?? '');

        if (text.length <= maxLength) {
          return text;
        }

        return `${text.substring(0, maxLength - 3)}...`;
      };

      const getReportTitle = () => {
        switch (reportType) {
          case 'income':
            return 'Income Report';

          case 'expense':
            return 'Expense Report';

          case 'transaction':
            return 'Transaction Report';

          case 'financial':
          default:
            return 'Financial Statement';
        }
      };

      const drawLine = (y = doc.y) => {
        doc
          .save()
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .moveTo(PAGE.left, y)
          .lineTo(PAGE.right, y)
          .stroke()
          .restore();
      };

      const drawDivider = () => {
        doc.moveDown(0.5);

        drawLine();

        doc.moveDown(0.7);
      };

      // ============================================================
      // PAGE HEADER
      // ============================================================

      const drawPageHeader = () => {
        const currentY = doc.y;

        doc.save();

        // ----------------------------------------------------------
        // LEFT SIDE
        // ----------------------------------------------------------

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.text)
          .text('Expense Tracker', PAGE.left, 30, {
            width: 200,
            lineBreak: false,
          });

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COLORS.muted)
          .text(`Generated: ${formatDate(new Date())}`, PAGE.left, 45, {
            width: 200,
            lineBreak: false,
          });

        // ----------------------------------------------------------
        // RIGHT SIDE - USER INFORMATION
        // ----------------------------------------------------------

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(userName, PAGE.right - 180, 30, {
            width: 180,
            align: 'right',
            lineBreak: false,
          });

        if (userEmail) {
          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor(COLORS.muted)
            .text(userEmail, PAGE.right - 180, 45, {
              width: 180,
              align: 'right',
              lineBreak: false,
            });
        }

        doc.restore();

        // Header is positioned absolutely.
        // Restore the document cursor.
        doc.y = currentY;
      };

      // ============================================================
      // PAGE FOOTER
      // ============================================================

      const drawPageFooter = () => {
        const currentY = doc.y;

        // Fixed footer position.
        const footerY = 805;

        doc.save();

        doc
          .strokeColor(COLORS.border)
          .lineWidth(0.5)
          .moveTo(PAGE.left, footerY)
          .lineTo(PAGE.right, footerY)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COLORS.lightMuted)
          .text('Generated by Expense Tracker', PAGE.left, footerY + 7, {
            width: 200,
            lineBreak: false,
          });

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COLORS.lightMuted)
          .text('System-generated document', PAGE.right - 150, footerY + 7, {
            width: 150,
            align: 'right',
            lineBreak: false,
          });

        doc.restore();

        // Footer must never affect document flow.
        doc.y = currentY;
      };

      // ============================================================
      // PAGE MANAGEMENT
      // ============================================================

      const startNewPage = () => {
        doc.addPage();

        drawPageHeader();

        // Content begins below the header.
        doc.y = 80;
      };

      const ensureSpace = (height = 40) => {
        if (doc.y + height > PAGE.bottom - 15) {
          startNewPage();
          return true;
        }

        return false;
      };

      const ensureSectionSpace = (height = 100) => {
        if (doc.y + height > PAGE.bottom - 15) {
          startNewPage();
          return true;
        }

        return false;
      };

      // ============================================================
      // SECTION TITLE
      // ============================================================

      const drawSectionTitle = (title, color = COLORS.text, requiredHeight = 75) => {
        ensureSectionSpace(requiredHeight);

        doc.font('Helvetica-Bold').fontSize(15).fillColor(color).text(title);

        doc.moveDown(0.5);
      };

      // ============================================================
      // TABLE HEADER
      // ============================================================

      const drawTableHeader = (columns, height = 25) => {
        const y = doc.y;

        doc
          .save()
          .fillColor(COLORS.tableHeader)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .fill();

        doc
          .strokeColor(COLORS.amberBorder)
          .lineWidth(1)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .stroke();

        columns.forEach((column) => {
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(COLORS.tableHeaderText)
            .text(column.label, column.x, y + 7, {
              width: column.width,
              align: column.align || 'left',
              lineBreak: false,
            });
        });

        doc.restore();

        doc.y = y + height + 4;
      };

      // ============================================================
      // GENERIC TABLE ROW
      // ============================================================

      const drawTableRow = ({ values, columns, index, height = 22, fontSize = 9 }) => {
        ensureSpace(height + 4);

        const y = doc.y;

        const background = index % 2 === 0 ? COLORS.white : COLORS.alternateRow;

        doc.save().fillColor(background).rect(PAGE.left, y, PAGE.contentWidth, height).fill();

        doc
          .strokeColor('#f3f4f6')
          .lineWidth(0.5)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .stroke();

        columns.forEach((column, columnIndex) => {
          const value = values[columnIndex] ?? '';

          doc
            .font('Helvetica')
            .fontSize(fontSize)
            .fillColor(COLORS.text)
            .text(String(value), column.x, y + 6, {
              width: column.width,
              align: column.align || 'left',
              lineBreak: false,
              ellipsis: true,
            });
        });

        doc.restore();

        doc.y = y + height;
      };

      // ============================================================
      // TABLE WITH PAGE BREAKS
      // ============================================================

      const drawTable = ({
        columns,
        rows,
        rowHeight = 22,
        emptyMessage = 'No records found.',
        rowMapper,
      }) => {
        const minimumTableHeight = 25 + rowHeight;

        // ----------------------------------------------------------
        // EMPTY TABLE
        // ----------------------------------------------------------

        if (rows.length === 0) {
          ensureSpace(50);

          drawTableHeader(columns);

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(COLORS.muted)
            .text(emptyMessage, PAGE.left + 15, doc.y + 4, {
              lineBreak: false,
            });

          doc.y += 28;

          return;
        }

        // ----------------------------------------------------------
        // KEEP SECTION + HEADER + FIRST ROW TOGETHER
        // ----------------------------------------------------------

        if (doc.y + minimumTableHeight > PAGE.bottom - 15) {
          startNewPage();
        }

        drawTableHeader(columns);

        rows.forEach((row, index) => {
          // --------------------------------------------------------
          // PAGE BREAK
          // --------------------------------------------------------

          if (doc.y + rowHeight > PAGE.bottom - 15) {
            startNewPage();

            drawTableHeader(columns);
          }

          drawTableRow({
            values: rowMapper(row, index),
            columns,
            index,
            height: rowHeight,
          });
        });
      };

      // ============================================================
      // SUMMARY CARDS
      // ============================================================

      const drawSummaryCards = () => {
        ensureSectionSpace(90);

        const y = doc.y;

        const gap = 10;

        const cardWidth = 155;

        const cardHeight = 68;

        const cards = [
          {
            x: PAGE.left,
            label: 'Total Income',
            value: formatAmount(totalIncome),
            color: COLORS.green,
          },
          {
            x: PAGE.left + cardWidth + gap,
            label: 'Total Expenses',
            value: formatAmount(totalExpense),
            color: COLORS.red,
          },
          {
            x: PAGE.left + (cardWidth + gap) * 2,
            label: 'Balance',
            value: formatAmount(balance),
            color: balance >= 0 ? COLORS.blue : COLORS.red,
          },
        ];

        cards.forEach((card) => {
          doc
            .save()
            .fillColor(COLORS.white)
            .roundedRect(card.x, y, cardWidth, cardHeight, 4)
            .fill();

          doc
            .strokeColor(COLORS.border)
            .lineWidth(1)
            .roundedRect(card.x, y, cardWidth, cardHeight, 4)
            .stroke();

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(COLORS.muted)
            .text(card.label, card.x + 15, y + 14, {
              lineBreak: false,
            });

          doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .fillColor(card.color)
            .text(card.value, card.x + 15, y + 32, {
              width: cardWidth - 30,
              ellipsis: true,
              lineBreak: false,
            });

          doc.restore();
        });

        doc.y = y + cardHeight + 20;
      };

      // ============================================================
      // REPORT TITLE
      // ============================================================

      const drawReportTitle = () => {
        ensureSectionSpace(90);

        // Left-aligned main report title
        doc
          .font('Helvetica-Bold')
          .fontSize(23)
          .fillColor(COLORS.text)
          .text(getReportTitle(), PAGE.left, doc.y, {
            width: PAGE.contentWidth,
            align: 'left',
            lineBreak: false,
          });

        doc.moveDown(0.5);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(COLORS.muted)
          .text(`Report Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, {
            width: PAGE.contentWidth,
            align: 'left',
            lineBreak: false,
          });

        doc.moveDown(1.3);
      };

      // ============================================================
      // INCOME TABLE
      // ============================================================

      const drawIncomeSection = () => {
        drawSectionTitle('Income Transactions', COLORS.green, 75);

        const columns = [
          {
            label: 'Date',
            x: 65,
            width: 105,
          },
          {
            label: 'Description',
            x: 180,
            width: 220,
          },
          {
            label: 'Amount',
            x: 430,
            width: 100,
            align: 'right',
          },
        ];

        drawTable({
          columns,
          rows: incomes,
          rowHeight: 22,
          emptyMessage: 'No income transactions for this period.',
          rowMapper: (income) => [
            formatDate(income.date),
            truncate(income.source || income.description || 'Income', 42),
            formatAmount(income.amount),
          ],
        });

        drawTotalRow('Total Income', totalIncome, COLORS.green, COLORS.greenLight);
      };

      // ============================================================
      // EXPENSE TABLE
      // ============================================================

      const drawExpenseSection = () => {
        drawSectionTitle('Expense Transactions', COLORS.red, 75);

        const columns = [
          {
            label: 'Date',
            x: 65,
            width: 105,
          },
          {
            label: 'Category',
            x: 180,
            width: 220,
          },
          {
            label: 'Amount',
            x: 430,
            width: 100,
            align: 'right',
          },
        ];

        drawTable({
          columns,
          rows: expenses,
          rowHeight: 22,
          emptyMessage: 'No expense transactions for this period.',
          rowMapper: (expense) => [
            formatDate(expense.date),
            truncate(expense.category || expense.description || 'Expense', 42),
            formatAmount(expense.amount),
          ],
        });

        drawTotalRow('Total Expenses', totalExpense, COLORS.red, COLORS.redLight);
      };

      // ============================================================
      // TOTAL ROW
      // ============================================================

      const drawTotalRow = (label, amount, color, background) => {
        const height = 25;

        if (doc.y + height > PAGE.bottom - 15) {
          startNewPage();
        }

        const y = doc.y;

        doc.save().fillColor(background).rect(PAGE.left, y, PAGE.contentWidth, height).fill();

        doc
          .strokeColor(COLORS.border)
          .lineWidth(1)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(color)
          .text(label, 180, y + 7, {
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(color)
          .text(formatAmount(amount), 430, y + 7, {
            width: 100,
            align: 'right',
            lineBreak: false,
          });

        doc.restore();

        doc.y = y + height + 18;
      };

      // ============================================================
      // BUDGET PERFORMANCE
      // ============================================================

      const drawBudgetSection = () => {
        drawSectionTitle('Budget Performance', COLORS.blue, 85);

        const columns = [
          {
            label: 'Month',
            x: 60,
            width: 70,
          },
          {
            label: 'Category',
            x: 130,
            width: 115,
          },
          {
            label: 'Budget',
            x: 245,
            width: 80,
            align: 'right',
          },
          {
            label: 'Spent',
            x: 325,
            width: 75,
            align: 'right',
          },
          {
            label: 'Remaining',
            x: 400,
            width: 75,
            align: 'right',
          },
          {
            label: 'Status',
            x: 475,
            width: 65,
            align: 'right',
          },
        ];

        drawTable({
          columns,
          rows: budgets,
          rowHeight: 24,
          emptyMessage: 'No budgets found for this period.',
          rowMapper: (budget) => {
            const month = budget.month
              ? `${String(budget.month).padStart(2, '0')}/${budget.year || ''}`
              : '-';

            return [
              month,
              truncate(budget.category || 'Other', 20),
              formatAmount(budget.budget),
              formatAmount(budget.spent),
              formatAmount(budget.remaining),
              truncate(budget.status || 'On Track', 12),
            ];
          },
        });

        doc.moveDown(0.5);
      };

      // ============================================================
      // SAVINGS GOALS
      // ============================================================

      const drawGoalsSection = () => {
        drawSectionTitle('Savings Goals', COLORS.brown, 85);

        const columns = [
          {
            label: 'Goal',
            x: 60,
            width: 160,
          },
          {
            label: 'Target',
            x: 220,
            width: 85,
            align: 'right',
          },
          {
            label: 'Saved',
            x: 305,
            width: 80,
            align: 'right',
          },
          {
            label: 'Progress',
            x: 385,
            width: 70,
            align: 'right',
          },
          {
            label: 'Target Date',
            x: 455,
            width: 85,
            align: 'right',
          },
        ];

        drawTable({
          columns,
          rows: goals,
          rowHeight: 24,
          emptyMessage: 'No savings goals found for this period.',
          rowMapper: (goal) => [
            truncate(goal.title || 'Savings Goal', 28),
            formatAmount(goal.targetAmount),
            formatAmount(goal.savedAmount),
            formatPercent(goal.progress),
            formatDate(goal.targetDate),
          ],
        });

        doc.moveDown(0.5);
      };

      // ============================================================
      // TRANSACTION TABLE
      // ============================================================

      const drawTransactionSection = () => {
        drawSectionTitle('Transactions', COLORS.amber, 75);

        const columns = [
          {
            label: 'Date',
            x: 60,
            width: 85,
          },
          {
            label: 'Type',
            x: 145,
            width: 75,
          },
          {
            label: 'Category / Description',
            x: 220,
            width: 190,
          },
          {
            label: 'Amount',
            x: 410,
            width: 130,
            align: 'right',
          },
        ];

        drawTable({
          columns,
          rows: transactions,
          rowHeight: 23,
          emptyMessage: 'No transactions found.',
          rowMapper: (transaction) => [
            formatDate(transaction.date),
            transaction.type || '-',
            truncate(transaction.description || transaction.category || '-', 38),
            formatAmount(transaction.amount),
          ],
        });

        // ----------------------------------------------------------
        // FINANCIAL TOTALS
        // ----------------------------------------------------------

        ensureSpace(65);

        doc.moveDown(0.7);

        const totalY = doc.y;

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.green)
          .text(`Total Income: ${formatAmount(totalIncome)}`, PAGE.left, totalY, {
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.red)
          .text(`Total Expenses: ${formatAmount(totalExpense)}`, PAGE.left, totalY + 18, {
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(balance >= 0 ? COLORS.blue : COLORS.red)
          .text(`Net Balance: ${formatAmount(balance)}`, 330, totalY + 9, {
            width: 210,
            align: 'right',
            lineBreak: false,
          });

        doc.y = totalY + 42;
      };

      // ============================================================
      // INITIAL PAGE
      // ============================================================

      drawPageHeader();

      // Start content below header.
      doc.y = 80;

      // ============================================================
      // REPORT RENDERING
      // ============================================================

      if (reportType === 'financial') {
        // ----------------------------------------------------------
        // FINANCIAL STATEMENT
        // ----------------------------------------------------------

        drawReportTitle();

        // Summary cards ONLY appear on the main report.
        drawSummaryCards();

        drawDivider();

        drawIncomeSection();

        drawDivider();

        drawExpenseSection();

        drawDivider();

        drawBudgetSection();

        drawDivider();

        drawGoalsSection();
      } else if (reportType === 'income') {
        // ----------------------------------------------------------
        // INCOME REPORT
        // ----------------------------------------------------------

        drawReportTitle();

        // No summary cards on individual reports.
        drawIncomeSection();
      } else if (reportType === 'expense') {
        // ----------------------------------------------------------
        // EXPENSE REPORT
        // ----------------------------------------------------------

        drawReportTitle();

        // No summary cards on individual reports.
        drawExpenseSection();
      } else if (reportType === 'transaction') {
        // ----------------------------------------------------------
        // TRANSACTION REPORT
        // ----------------------------------------------------------

        drawReportTitle();

        // No summary cards.
        drawTransactionSection();
      } else {
        // ----------------------------------------------------------
        // FALLBACK
        // ----------------------------------------------------------

        drawReportTitle();

        // Fallback behaves like the main financial report.
        drawSummaryCards();

        drawDivider();

        drawIncomeSection();

        drawDivider();

        drawExpenseSection();
      }

      // ============================================================
      // DRAW FOOTERS ON EXISTING PAGES
      // ============================================================

      const range = doc.bufferedPageRange();

      for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex++) {
        doc.switchToPage(pageIndex);

        drawPageFooter();
      }

      // ============================================================
      // COMPLETE PDF
      // ============================================================

      doc.on('error', (error) => {
        reject(error);
      });

      doc.on('end', () => {
        resolve();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generatePDF;
