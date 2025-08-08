import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <Outlet />
    </div>
  );
};

export default AppLayout;