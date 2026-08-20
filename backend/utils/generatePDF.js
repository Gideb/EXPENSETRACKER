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
  black: '#111111',
  white: '#ffffff',

  amber: '#92400e',
  amberLight: '#fffbeb',
  amberBorder: '#f3e8d0',

  muted: '#666666',
  lightMuted: '#999999',

  border: '#e5e5e5',
};

const generatePDF = (res, data = {}) => {
  return new Promise((resolve, reject) => {
    let doc;

    try {
      // ============================================================
      // PDF DOCUMENT
      // ============================================================

      doc = new PDFDocument({
        size: 'A4',
        margin: 50,

        // We need buffered pages so that headers/footers can be
        // positioned without creating additional pages.
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

      // ============================================================
      // USER INFORMATION
      // ============================================================

      const user = data.user || {};

      const userName = user.fullName || user.name || data.name || 'User';

      const userEmail = user.email || data.userEmail || data.email || '';

      // ============================================================
      // REPORT PERIOD
      // ============================================================

      const startDate = data.startDate || data.period?.start || new Date();

      const endDate = data.endDate || data.period?.end || new Date();

      // ============================================================
      // TOTALS
      // ============================================================

      const totalIncome =
        data.totalIncome ??
        summary.income ??
        incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const totalExpense =
        data.totalExpense ??
        summary.expense ??
        expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const balance = data.balance ?? summary.balance ?? totalIncome - totalExpense;

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
        if (!date) {
          return '-';
        }

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

      // ============================================================
      // DIVIDER
      // ============================================================

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
        doc.save();

        // ----------------------------------------------------------
        // LEFT
        // ----------------------------------------------------------

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.black)
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
        // RIGHT - USER
        // ----------------------------------------------------------

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(COLORS.black)
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
      };

      // ============================================================
      // PAGE FOOTER
      // ============================================================
      //
      // IMPORTANT:
      // Do NOT put the footer at y=805.
      //
      // PDFKit's bottom margin is 50px, so 805 is outside the
      // usable content area and can cause PDFKit to create another
      // page automatically.
      //
      // We use 770 instead.
      // ============================================================

      const drawPageFooter = () => {
        const footerLineY = 770;
        const footerTextY = 778;

        doc.save();

        doc
          .strokeColor(COLORS.border)
          .lineWidth(0.5)
          .moveTo(PAGE.left, footerLineY)
          .lineTo(PAGE.right, footerLineY)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COLORS.lightMuted)
          .text('Generated by Expense Tracker', PAGE.left, footerTextY, {
            width: 200,
            lineBreak: false,
          });

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COLORS.lightMuted)
          .text('System-generated document', PAGE.right - 150, footerTextY, {
            width: 150,
            align: 'right',
            lineBreak: false,
          });

        doc.restore();
      };

      // ============================================================
      // PAGE MANAGEMENT
      // ============================================================

      const startNewPage = () => {
        doc.addPage();

        drawPageHeader();

        // Always reset the content cursor to the left.
        doc.x = PAGE.left;

        // Content starts below header.
        doc.y = 80;
      };

      const ensureSpace = (height = 40) => {
        if (doc.y + height > PAGE.bottom - 25) {
          startNewPage();

          return true;
        }

        return false;
      };

      const ensureSectionSpace = (height = 100) => {
        if (doc.y + height > PAGE.bottom - 25) {
          startNewPage();

          return true;
        }

        return false;
      };

      // ============================================================
      // SECTION TITLE
      // ============================================================
      //
      // IMPORTANT:
      // Explicitly set PAGE.left.
      //
      // Previously this relied on doc.x. After a right-aligned
      // amount was rendered, doc.x could be around 430, causing
      // headings such as "Expense Transactions" to appear on the
      // far right.
      // ============================================================

      const drawSectionTitle = (title, requiredHeight = 75) => {
        ensureSectionSpace(requiredHeight);

        // Force cursor back to the left.
        doc.x = PAGE.left;

        doc
          .font('Helvetica-Bold')
          .fontSize(15)
          .fillColor(COLORS.amber)
          .text(title, PAGE.left, doc.y, {
            width: PAGE.contentWidth,
            align: 'left',
            lineBreak: false,
          });

        doc.x = PAGE.left;

        doc.moveDown(0.5);
      };

      // ============================================================
      // TABLE HEADER
      // ============================================================

      const drawTableHeader = (columns, height = 25) => {
        const y = doc.y;

        doc
          .save()
          .fillColor(COLORS.amberLight)
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
            .fillColor(COLORS.amber)
            .text(column.label, column.x, y + 7, {
              width: column.width,
              align: column.align || 'left',
              lineBreak: false,
            });
        });

        doc.restore();

        doc.x = PAGE.left;
        doc.y = y + height + 4;
      };

      // ============================================================
      // TABLE ROW
      // ============================================================

      const drawTableRow = ({ values, columns, index, height = 22, fontSize = 9 }) => {
        ensureSpace(height + 4);

        const y = doc.y;

        // Pure white rows.
        // No alternating colors.
        doc.save().fillColor(COLORS.white).rect(PAGE.left, y, PAGE.contentWidth, height).fill();

        doc
          .strokeColor('#eeeeee')
          .lineWidth(0.5)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .stroke();

        columns.forEach((column, columnIndex) => {
          const value = values[columnIndex] ?? '';

          doc
            .font('Helvetica')
            .fontSize(fontSize)
            .fillColor(COLORS.black)
            .text(String(value), column.x, y + 6, {
              width: column.width,
              align: column.align || 'left',
              lineBreak: false,
              ellipsis: true,
            });
        });

        doc.restore();

        doc.x = PAGE.left;
        doc.y = y + height;
      };

      // ============================================================
      // TABLE
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
            .fillColor(COLORS.black)
            .text(emptyMessage, PAGE.left + 15, doc.y + 4, {
              width: PAGE.contentWidth - 30,
              lineBreak: false,
            });

          doc.y += 28;
          doc.x = PAGE.left;

          return;
        }

        // ----------------------------------------------------------
        // KEEP HEADER + FIRST ROW TOGETHER
        // ----------------------------------------------------------

        if (doc.y + minimumTableHeight > PAGE.bottom - 25) {
          startNewPage();
        }

        drawTableHeader(columns);

        rows.forEach((row, index) => {
          if (doc.y + rowHeight > PAGE.bottom - 25) {
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

        doc.x = PAGE.left;
      };

      // ============================================================
      // SUMMARY CARDS
      // ============================================================
      //
      // Summary cards are ONLY used by the main Financial Statement.
      // They are deliberately not used by individual reports.
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
          },
          {
            x: PAGE.left + cardWidth + gap,
            label: 'Total Expenses',
            value: formatAmount(totalExpense),
          },
          {
            x: PAGE.left + (cardWidth + gap) * 2,
            label: 'Balance',
            value: formatAmount(balance),
          },
        ];

        cards.forEach((card) => {
          doc
            .save()
            .fillColor(COLORS.white)
            .roundedRect(card.x, y, cardWidth, cardHeight, 4)
            .fill();

          doc
            .strokeColor(COLORS.amberBorder)
            .lineWidth(1)
            .roundedRect(card.x, y, cardWidth, cardHeight, 4)
            .stroke();

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(COLORS.muted)
            .text(card.label, card.x + 15, y + 14, {
              width: cardWidth - 30,
              lineBreak: false,
            });

          doc
            .font('Helvetica-Bold')
            .fontSize(14)
            .fillColor(COLORS.amber)
            .text(card.value, card.x + 15, y + 32, {
              width: cardWidth - 30,
              ellipsis: true,
              lineBreak: false,
            });

          doc.restore();
        });

        doc.x = PAGE.left;
        doc.y = y + cardHeight + 20;
      };

      // ============================================================
      // REPORT TITLE
      // ============================================================

      const drawReportTitle = () => {
        ensureSectionSpace(90);

        // Explicitly reset X.
        doc.x = PAGE.left;

        doc
          .font('Helvetica-Bold')
          .fontSize(23)
          .fillColor(COLORS.black)
          .text(getReportTitle(), PAGE.left, doc.y, {
            width: PAGE.contentWidth,
            align: 'left',
            lineBreak: false,
          });

        doc.x = PAGE.left;

        doc.moveDown(0.5);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(COLORS.muted)
          .text(
            `Report Period: ${formatDate(startDate)} - ${formatDate(endDate)}`,
            PAGE.left,
            doc.y,
            {
              width: PAGE.contentWidth,
              align: 'left',
              lineBreak: false,
            }
          );

        doc.x = PAGE.left;

        doc.moveDown(1.3);
      };

      // ============================================================
      // INCOME SECTION
      // ============================================================

      const drawIncomeSection = () => {
        drawSectionTitle('Income Transactions', 75);

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

        drawTotalRow('Total Income', totalIncome);
      };

      // ============================================================
      // EXPENSE SECTION
      // ============================================================

      const drawExpenseSection = () => {
        drawSectionTitle('Expense Transactions', 75);

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

        drawTotalRow('Total Expenses', totalExpense);
      };

      // ============================================================
      // TOTAL ROW
      // ============================================================

      const drawTotalRow = (label, amount) => {
        const height = 28;

        if (doc.y + height > PAGE.bottom - 25) {
          startNewPage();
        }

        const y = doc.y;

        doc.save().fillColor(COLORS.white).rect(PAGE.left, y, PAGE.contentWidth, height).fill();

        doc
          .strokeColor(COLORS.amberBorder)
          .lineWidth(1)
          .rect(PAGE.left, y, PAGE.contentWidth, height)
          .stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.black)
          .text(label, 180, y + 8, {
            width: 200,
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor(COLORS.black)
          .text(formatAmount(amount), 430, y + 8, {
            width: 100,
            align: 'right',
            lineBreak: false,
          });

        doc.restore();

        doc.x = PAGE.left;
        doc.y = y + height + 18;
      };

      // ============================================================
      // BUDGET SECTION
      // ============================================================

      const drawBudgetSection = () => {
        drawSectionTitle('Budget Performance', 85);

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

        doc.x = PAGE.left;
      };

      // ============================================================
      // SAVINGS GOALS
      // ============================================================

      const drawGoalsSection = () => {
        drawSectionTitle('Savings Goals', 85);

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

        doc.x = PAGE.left;
      };

      // ============================================================
      // TRANSACTION SECTION
      // ============================================================

      const drawTransactionSection = () => {
        drawSectionTitle('Transactions', 75);

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
        // TRANSACTION TOTALS
        // ----------------------------------------------------------

        ensureSpace(70);

        doc.moveDown(0.7);

        const totalY = doc.y;

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(COLORS.black)
          .text(`Total Income: ${formatAmount(totalIncome)}`, PAGE.left, totalY, {
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(COLORS.black)
          .text(`Total Expenses: ${formatAmount(totalExpense)}`, PAGE.left, totalY + 20, {
            lineBreak: false,
          });

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(COLORS.black)
          .text(`Net Balance: ${formatAmount(balance)}`, 330, totalY + 10, {
            width: 210,
            align: 'right',
            lineBreak: false,
          });

        doc.x = PAGE.left;
        doc.y = totalY + 42;
      };

      // ============================================================
      // INITIAL PAGE
      // ============================================================

      drawPageHeader();

      doc.x = PAGE.left;
      doc.y = 80;

      // ============================================================
      // REPORT RENDERING
      // ============================================================

      if (reportType === 'financial') {
        // ========================================================
        // FINANCIAL STATEMENT
        // ========================================================

        drawReportTitle();

        // Summary cards ONLY on the main report.
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
        // ========================================================
        // INCOME REPORT
        // ========================================================

        drawReportTitle();

        // No summary cards.
        drawIncomeSection();
      } else if (reportType === 'expense') {
        // ========================================================
        // EXPENSE REPORT
        // ========================================================

        drawReportTitle();

        // No summary cards.
        drawExpenseSection();
      } else if (reportType === 'transaction') {
        // ========================================================
        // TRANSACTION REPORT
        // ========================================================

        drawReportTitle();

        // No summary cards.
        drawTransactionSection();
      } else {
        // ========================================================
        // FALLBACK
        // ========================================================

        drawReportTitle();

        drawSummaryCards();

        drawDivider();

        drawIncomeSection();

        drawDivider();

        drawExpenseSection();
      }

      // ============================================================
      // ADD FOOTERS TO EXISTING PAGES
      // ============================================================
      //
      // IMPORTANT:
      //
      // We NEVER call addPage() here.
      //
      // We also keep the footer above PDFKit's bottom margin.
      //
      // This prevents footer-only pages from being generated.
      // ============================================================

      const pageRange = doc.bufferedPageRange();

      for (
        let pageIndex = pageRange.start;
        pageIndex < pageRange.start + pageRange.count;
        pageIndex++
      ) {
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
