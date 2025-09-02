import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer, Zoom } from "react-toastify";
import "./index.css";
import App from "@/App.tsx";
import Home from "@/components/Home.tsx";
import { env } from "@/config/env";
import PublicRoute from "@/routes/PublicRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Dashboard from "@/components/DashBoard";
import NotFound from "@/components/NotFound";
import Sidebar from "@/components/SideBar";
import IntelliAdd from "./components/IntelliAdd";
import Analytics from "./components/Analytics";
import Transactions from "./components/transactions/Transactions";

export const queryClient = new QueryClient();
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <PublicRoute />,
        children: [{ index: true, element: <Home /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "/add", element: <IntelliAdd /> },
          { path: "/analytics", element: <Analytics /> },
          { path: "/transactions", element: <Transactions /> },
        ],
      },
      {
        path: "/sideBar",
        element: <Sidebar />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="colored"
        transition={Zoom}
      />
      <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
