import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import Dashboardlayout from '../../components/layouts/Dashboardlayout';
import TransactionList from '../../components/Transaction/TransactionList';
import DeleteAlert from '../../components/Modals/DeleteAlert';
import Modal from '../../components/Modals/Modal';

import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useUserAuth } from '../../hooks/useUserAuth';

const TransactionPage = () => {
  useUserAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(API_PATHS.TRANSACTIONS.GET_ALL);

      setTransactions(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed loading transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);


  //delete transaction
  const deleteTransaction = async (transaction) => {
    try {
      await axiosInstance.delete(API_PATHS.TRANSACTIONS.DELETE(transaction.type, transaction._id));

      toast.success('Transaction deleted');

      setOpenDeleteAlert({
        show: false,
        data: null,
      });

      fetchTransactions();
    } catch (error) {
      toast.error('Delete failed');
    }
  };


  //download excel
const handleDownloadExcel = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.TRANSACTIONS.EXPORT_EXCEL, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.xlsx';

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success('Excel downloaded successfully.');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to download Excel.');
  }
};

 //handle export  in pdf
 const handleExportPDF = async () => {
   try {
     const response = await axiosInstance.get(API_PATHS.TRANSACTIONS.EXPORT_PDF, {
       responseType: 'blob',
     });

     const blob = new Blob([response.data], { type: 'application/pdf' });
     const url = window.URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = 'transactions_report.pdf';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     window.URL.revokeObjectURL(url);
     toast.success('PDF exported successfully.');
   } catch (error) {
     toast.error(
       error.response?.data?.message || 'Failed to export transactions.'
     );
   }
 };

  


  return (
    <Dashboardlayout activeMenu="Transactions">
      <div className="space-y-6 my-5">
        <TransactionList
          transactions={transactions}
          onDelete={(item) =>
            setOpenDeleteAlert({
              show: true,
              data: item,
            })
          }
          onDownload={handleDownloadExcel}
          exportPDF={handleExportPDF}
        />

        {loading && <p>Loading transactions...</p>}

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() =>
            setOpenDeleteAlert({
              show: false,
              data: null,
            })
          }
          title="Delete Transaction"
        >
          <DeleteAlert
            content={`${
              openDeleteAlert.data?.type === 'expense'
                ? openDeleteAlert.data?.category
                : openDeleteAlert.data?.source
            }
        transaction will be deleted. `}
            onCancel={() =>
              setOpenDeleteAlert({
                show: false,
                data: null,
              })
            }
            onDelete={() => deleteTransaction(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </Dashboardlayout>
  );
};

export default TransactionPage;
