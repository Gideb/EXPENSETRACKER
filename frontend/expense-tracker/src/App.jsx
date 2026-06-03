import AppRoutes from "./routes/AppRoutes";
import UserProvider from "./context/UserContext.jsx";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <UserProvider>
        <AppRoutes />

        <Toaster toastOptions={{ className: "", style: { fontSize: "13" } }} />
      </UserProvider>
    </>
  );
};

export default App;
