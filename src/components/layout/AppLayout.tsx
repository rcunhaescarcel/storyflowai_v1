import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import { useState } from "react";
import { BuyCoinsModal } from "@/components/billing/BuyCoinsModal";

const AppLayout = () => {
  const [isBuyCoinsModalOpen, setIsBuyCoinsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <AppHeader onBuyCoinsClick={() => setIsBuyCoinsModalOpen(true)} />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <BuyCoinsModal 
        isOpen={isBuyCoinsModalOpen} 
        onClose={() => setIsBuyCoinsModalOpen(false)} 
      />
    </div>
  );
};

export default AppLayout;