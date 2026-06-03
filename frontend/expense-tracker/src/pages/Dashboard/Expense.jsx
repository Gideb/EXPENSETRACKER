import Dashboardlayout from "../../components/layouts/Dashboardlayout";
import { useUserAuth } from "../../hooks/useUserAuth";

const Expense = () => {
  useUserAuth();

    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(false);
   
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
      show: false,
      data: null,
    });
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);


  return (
    <Dashboardlayout activeMenu="Expense">
      <div className="space-y-6 my-5 mx-auto">expense</div>
    </Dashboardlayout>
  );
}

export default Expense
