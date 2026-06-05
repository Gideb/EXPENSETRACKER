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

        <Toaster
          position="top-right"
          containerStyle={{
            top: 12,
            right: 20 ,
          }}
          toastOptions={{
            className: "text-[11px] font-normal",
          }}
        />
      </UserProvider>
    </>
  );
};

export default App;
