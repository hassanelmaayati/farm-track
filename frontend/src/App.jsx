import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Spinner from "./components/ui/Spinner";
import Structures from "./pages/Structures";
import StructureDetail from "./pages/StructureDetail";
import Animals from "./pages/Animals";
import AnimalDetail from "./pages/AnimalDetail";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

// The dashboard pulls in the charting library, so load it on demand.
const Dashboard = lazy(() => import("./pages/Dashboard"));

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<Spinner />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route path="structures" element={<Structures />} />
          <Route path="structures/:id" element={<StructureDetail />} />
          <Route path="animals" element={<Animals />} />
          <Route path="animals/:id" element={<AnimalDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
