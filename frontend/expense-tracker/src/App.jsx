import AppRoutes from "./routes/AppRoutes";
import UserProvider from "./context/UserContext.jsx";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
const App = () => {
  return (
    <>
      <UserProvider>
        <AppRoutes />
        <Analytics />
        <SpeedInsights />

        <Toaster toastOptions={{ className: "", style: { fontSize: "13" } }} />
      </UserProvider>
    </>
  );
};

export default App;
