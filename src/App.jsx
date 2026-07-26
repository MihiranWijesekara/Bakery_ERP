import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Production } from "./pages/Production";
import { Purchasing } from "./pages/Purchasing";
import { Sales } from "./pages/Sales";
import { QualityControl } from "./pages/QualityControl";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";

function App() {
  const { user, toasts, removeToast, showToast } = useContext(AppContext);
  const [activePage, setActivePage] = useState("Dashboard");
  const activePageRef = useRef("Dashboard");
  const [subTabs, setSubTabs] = useState({
    Inventory: "materials",
    Production: "runs",
    Purchasing: "orders",
    Sales: "orders",
    "Quality Control": "logs",
    Settings: "profile",
    Reports: "overview",
  });
  const [productionWizardOpen, setProductionWizardOpen] = useState(false);
  const [purchaseWizardOpen, setPurchaseWizardOpen] = useState(false);
  const [salesWizardOpen, setSalesWizardOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      activePageRef.current = "Dashboard";
      setActivePage("Dashboard");
      setProductionWizardOpen(false);
      setPurchaseWizardOpen(false);
      setSalesWizardOpen(false);
      setProductModalOpen(false);
      setSupplierModalOpen(false);
    }
  }, [user]);

  const goToPage = (pageName) => {
    activePageRef.current = pageName;
    setActivePage(pageName);
  };

  const currentSubTab = subTabs[activePage] || "overview";
  const setCurrentSubTab = (nextTab) => {
    setSubTabs((prev) => ({ ...prev, [activePageRef.current]: nextTab }));
  };

  const handleQuickActionOpen = (action) => {
    if (action === "production") {
      goToPage("Production");
      setProductionWizardOpen(true);
      return;
    }

    if (action === "purchase") {
      goToPage("Purchasing");
      setPurchaseWizardOpen(true);
      return;
    }

    if (action === "sales") {
      goToPage("Sales");
      setSalesWizardOpen(true);
      return;
    }

    if (action === "product") {
      goToPage("Inventory");
      setCurrentSubTab("products");
      setProductModalOpen(true);
      return;
    }

    if (action === "supplier") {
      goToPage("Purchasing");
      setCurrentSubTab("suppliers");
      setSupplierModalOpen(true);
      return;
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "Inventory":
        return (
          <Inventory
            subActiveTab={currentSubTab}
            setSubActiveTab={setCurrentSubTab}
            isProductModalOpen={productModalOpen}
            setIsProductModalOpen={setProductModalOpen}
          />
        );
      case "Production":
        return (
          <Production
            subActiveTab={currentSubTab}
            setSubActiveTab={setCurrentSubTab}
            isWizardOpen={productionWizardOpen}
            setIsWizardOpen={setProductionWizardOpen}
          />
        );
      case "Purchasing":
        return (
          <Purchasing
            subActiveTab={currentSubTab}
            setSubActiveTab={setCurrentSubTab}
            isWizardOpen={purchaseWizardOpen}
            setIsWizardOpen={setPurchaseWizardOpen}
            isSupplierModalOpen={supplierModalOpen}
            setIsSupplierModalOpen={setSupplierModalOpen}
          />
        );
      case "Sales":
        return (
          <Sales
            subActiveTab={currentSubTab}
            setSubActiveTab={setCurrentSubTab}
            isWizardOpen={salesWizardOpen}
            setIsWizardOpen={setSalesWizardOpen}
          />
        );
      case "Quality Control":
        return (
          <QualityControl
            subActiveTab={currentSubTab}
            setSubActiveTab={setCurrentSubTab}
          />
        );
      case "Settings":
        return <Settings />;
      case "Reports":
        return <Reports />;
      case "Dashboard":
      default:
        return (
          <Dashboard
            setActivePage={goToPage}
            setSubActiveTab={setCurrentSubTab}
            setQuickActionOpen={handleQuickActionOpen}
          />
        );
    }
  };

  return (
    <>
      {!user ? (
        <Login />
      ) : (
        <Layout
          activePage={activePage}
          setActivePage={goToPage}
          setSubActiveTab={setCurrentSubTab}
        >
          {renderPage()}
        </Layout>
      )}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
