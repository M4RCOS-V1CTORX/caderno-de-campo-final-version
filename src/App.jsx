import { useEffect, useState } from "react";
import { syncNow, getSyncErrorMessage } from "./services/syncService";
import {
  RefreshCw,
  Sprout,
  Sparkles,
  Cloud,
  CloudOff,
  Check,
  AlertCircle,
  ClipboardList,
  Building2,
  LibraryBig,
  ShoppingCart,
} from "lucide-react";

import Home from "./pages/home";
import NewActivity from "./pages/NewActivity";
import ActivityDetails from "./pages/ActivityDetails";
import Plots from "./pages/Plots";
import NewPlot from "./pages/NewPlot";
import Properties from "./pages/Properties";
import NewProperty from "./pages/NewProperty";
import Diary from "./pages/Diary";
import Library from "./pages/Library";
import NewProduct from "./pages/NewProduct";
import Pests from "./pages/Pests";
import NewPest from "./pages/NewPest";
import Diseases from "./pages/Diseases";
import NewDisease from "./pages/NewDisease";
import Cultures from "./pages/Cultures";
import NewCulture from "./pages/NewCulture";
import Reports from "./pages/Reports";
import Orders from "./pages/Orders";
import NewOrder from "./pages/NewOrder";
import Management from "./pages/Management";
import OrderDetails from "./pages/orderDetails";


import "./styles/global.css";

function App() {
  const [page, setPage] = useState("home");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncErrorDetail, setSyncErrorDetail] = useState("");
  const [syncState, setSyncState] = useState("idle");
  const [syncRevision, setSyncRevision] = useState(0);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  /**
   * =========================================================
   * STATUS DA INTERNET
   * Funciona no PC e no celular.
   * =========================================================
   */
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);

      if (!syncing) {
        setSyncState("idle");
        setSyncMessage("");
      }

      console.log("🌐 INTERNET CONECTADA");
    }

    function handleOffline() {
      setIsOnline(false);
      setSyncing(false);
      setSyncState("offline");
      setSyncMessage("Sem conexão");
      setSyncErrorDetail("");

      console.log("📴 INTERNET DESCONECTADA");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncing]);

  /**
   * =========================================================
   * SINCRONIZAÇÃO
   * O HEADER acompanha claramente o processo.
   * =========================================================
   */
  async function handleSync() {
    if (syncing) return;

    if (!navigator.onLine) {
      setIsOnline(false);
      setSyncState("offline");
      setSyncMessage("Sem conexão");
      return;
    }

    console.log("🔘 BOTÃO SINCRONIZAR CLICADO!");
    console.log("🌐 navigator.onLine:", navigator.onLine);
    console.log("📡 Estado isOnline:", isOnline);

    setSyncing(true);
    setSyncState("syncing");
    setSyncMessage("Sincronizando...");
    setSyncErrorDetail("");

    try {
      console.log("🚀 CHAMANDO syncNow()...");

      const result = await syncNow();

      console.log("✅ syncNow() TERMINOU!", result);

      setSyncRevision((value) => value + 1);
      setSyncState("success");
      setSyncErrorDetail("");

      const sent =
        Number(result?.sent || 0);

      const received =
        Number(result?.received || 0);

      if (sent > 0 || received > 0) {
        setSyncMessage(
          `Sincronizado • ${sent} enviados • ${received} recebidos`
        );
      } else {
        setSyncMessage("Tudo sincronizado");
      }

      /**
       * Mantém o feedback visível por alguns segundos.
       */
      window.setTimeout(() => {
        setSyncState("idle");
        setSyncMessage("");
      }, 5000);
    } catch (error) {
      console.error(
        "❌ ERRO NA SINCRONIZAÇÃO:",
        error
      );

      setSyncState("error");
      setSyncMessage(getSyncErrorMessage(error));
      setSyncErrorDetail(
        error?.message || String(error || "Erro desconhecido.")
      );

      window.setTimeout(() => {
        setSyncState("idle");
        setSyncMessage("");
      }, 6000);
    } finally {
      console.log("🏁 FINALIZANDO handleSync()");
      setSyncing(false);
    }
  }


  // Sincroniza automaticamente ao abrir o sistema ou quando a internet voltar.
  useEffect(() => {
    if (!isOnline) return;

    const timer = window.setTimeout(() => {
      handleSync();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isOnline]);


  // =========================================================
  // PEDIDOS
  // =========================================================

  const [orderToView, setOrderToView] =
    useState(null);

  const [orderToEdit, setOrderToEdit] =
    useState(null);

  // =========================================================
  // ATIVIDADES
  // =========================================================

  const [activityToEdit, setActivityToEdit] =
    useState(null);

  const [activityToView, setActivityToView] =
    useState(null);

  function goToEditActivity(activity) {
    setActivityToEdit(activity);
    setPage("newActivity");
  }

  function goToActivityDetails(activity) {
    setActivityToView(activity);
    setPage("activityDetails");
  }

  function goToNewActivity() {
    setActivityToEdit(null);
    setPage("newActivity");
  }

  // =========================================================
  // HOME
  // =========================================================

  function goToHome() {
    setActivityToEdit(null);
    setActivityToView(null);

    setPropertyToEdit(null);
    setPlotToEdit(null);

    setProductToEdit(null);
    setPestToEdit(null);
    setDiseaseToEdit(null);
    setCultureToEdit(null);

    setOrderToView(null);
    setOrderToEdit(null);

    setPage("home");
  }

  // =========================================================
  // RELATÓRIOS
  // =========================================================

  function goToReports() {
    setPage("reports");
  }

  // =========================================================
  // DIÁRIO
  // =========================================================

  function goToDiary() {
    setPage("diary");
  }

  // =========================================================
  // PROPRIEDADES
  // =========================================================

  const [propertyToEdit, setPropertyToEdit] =
    useState(null);

  const [selectedProperty, setSelectedProperty] =
    useState(null);

  function goToProperties() {
    setPropertyToEdit(null);
    setPage("properties");
  }

  function goToNewProperty() {
    setPropertyToEdit(null);
    setPage("newProperty");
  }

  function goToEditProperty(property) {
    setPropertyToEdit(property);
    setPage("newProperty");
  }

  function goToPropertiesAfterSave() {
    setPropertyToEdit(null);
    setPage("properties");
  }

  // =========================================================
  // TALHÕES
  // =========================================================

  const [plotToEdit, setPlotToEdit] =
    useState(null);

  function goToPlots(property) {
    setSelectedProperty(property);
    setPlotToEdit(null);
    setPage("plots");
  }

  function goToNewPlot() {
    if (!selectedProperty) {
      return;
    }

    setPlotToEdit(null);
    setPage("newPlot");
  }

  function goToEditPlot(plot) {
    setPlotToEdit(plot);
    setPage("newPlot");
  }

  // =========================================================
  // BIBLIOTECA
  // =========================================================

  const [productToEdit, setProductToEdit] =
    useState(null);

  function goToLibrary() {
    setProductToEdit(null);
    setPage("library");
  }

  function goToNewProduct() {
    setProductToEdit(null);
    setPage("newProduct");
  }

  function goToEditProduct(product) {
    setProductToEdit(product);
    setPage("newProduct");
  }

  function goToLibraryAfterSave() {
    setProductToEdit(null);
    setPage("library");
  }

  // =========================================================
  // PRAGAS
  // =========================================================

  const [pestToEdit, setPestToEdit] =
    useState(null);

  function goToPests() {
    setPestToEdit(null);
    setPage("pests");
  }

  function goToNewPest() {
    setPestToEdit(null);
    setPage("newPest");
  }

  function goToEditPest(pest) {
    setPestToEdit(pest);
    setPage("newPest");
  }

  function goToPestsAfterSave() {
    setPestToEdit(null);
    setPage("pests");
  }

  // =========================================================
  // DOENÇAS
  // =========================================================

  const [diseaseToEdit, setDiseaseToEdit] =
    useState(null);

  function goToDiseases() {
    setDiseaseToEdit(null);
    setPage("diseases");
  }

  function goToNewDisease() {
    setDiseaseToEdit(null);
    setPage("newDisease");
  }

  function goToEditDisease(disease) {
    setDiseaseToEdit(disease);
    setPage("newDisease");
  }

  function goToDiseasesAfterSave() {
    setDiseaseToEdit(null);
    setPage("diseases");
  }

  // =========================================================
  // CULTURAS
  // =========================================================

  const [cultureToEdit, setCultureToEdit] =
    useState(null);

  function goToCultures() {
    setCultureToEdit(null);
    setPage("cultures");
  }

  function goToNewCulture() {
    setCultureToEdit(null);
    setPage("newCulture");
  }

  function goToEditCulture(culture) {
    setCultureToEdit(culture);
    setPage("newCulture");
  }

  function goToCulturesAfterSave() {
    setCultureToEdit(null);
    setPage("cultures");
  }

  // =========================================================
  // MANEJO
  // =========================================================

  function goToManagement() {
    setPage("management");
  }

  // =========================================================
  // PEDIDOS
  // =========================================================

  function goToOrders() {
    setOrderToView(null);
    setOrderToEdit(null);
    setPage("orders");
  }

  function goToNewOrder() {
    setOrderToEdit(null);
    setPage("new-order");
  }

  function goToOrderDetails(order) {
    setOrderToView(order);
    setPage("order-details");
  }

  function goToEditOrder(order) {
    setOrderToEdit(order);
    setPage("edit-order");
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="header">
        <header
          className={`app-header sync-header-${syncState}`}
        >
          <div className="header-glow header-glow-left" />
          <div className="header-glow header-glow-right" />

          <div className="header-content">
            {/* =================================================
                MARCA
            ================================================== */}
            <div className="brand-section">
              <div className="brand-icon">
                <div className="brand-icon-glow" />

                <Sprout
                  size={28}
                  strokeWidth={2}
                />
              </div>

              <div className="brand-text">
                <div className="brand-title-row">
                  <h1>
                    Caderno de Campo
                  </h1>

                  <span className="premium-badge">
                    <Sparkles size={11} />
                    PRO
                  </span>
                </div>

                <div className="brand-subtitle">
                  <span className="subtitle-dot" />

                  <p>
                    Gestão agrícola inteligente
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                STATUS + SINCRONIZAÇÃO
            ================================================== */}
            <div className="header-actions">

              {/* STATUS DA CONEXÃO */}
              <div
                className={`connection-card ${
                  isOnline
                    ? "online"
                    : "offline"
                } ${
                  syncState === "syncing"
                    ? "syncing"
                    : ""
                } ${
                  syncState === "success"
                    ? "sync-success"
                    : ""
                } ${
                  syncState === "error"
                    ? "sync-error"
                    : ""
                }`}
              >
                <div className="connection-icon-wrapper">
                  <div className="connection-pulse" />

                  {syncState === "syncing" ? (
                    <RefreshCw
                      size={19}
                      strokeWidth={1.8}
                      className="sync-rotating"
                    />
                  ) : syncState === "success" ? (
                    <Check
                      size={20}
                      strokeWidth={2.2}
                    />
                  ) : syncState === "error" ? (
                    <AlertCircle
                      size={20}
                      strokeWidth={2}
                    />
                  ) : isOnline ? (
                    <Cloud
                      size={19}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <CloudOff
                      size={19}
                      strokeWidth={1.8}
                    />
                  )}
                </div>

                <div className="connection-info">
                  <span className="connection-label">
                    STATUS DO SISTEMA
                  </span>

                  <div className="connection-value">
                    <strong>
                      {syncMessage ||
                        (isOnline
                          ? "Online"
                          : "Offline")}
                    </strong>

                    {isOnline &&
                      syncState === "idle" && (
                        <span className="connection-online-dot" />
                      )}
                  </div>
                </div>
              </div>

              {/* BOTÃO DE SINCRONIZAÇÃO */}
              <button
                type="button"
                className={`premium-sync-button ${
                  syncState === "success"
                    ? "sync-button-success"
                    : ""
                } ${
                  syncState === "error"
                    ? "sync-button-error"
                    : ""
                }`}
                onClick={handleSync}
                disabled={
                  syncing || !isOnline
                }
                aria-label={
                  syncing
                    ? "Sincronizando dados"
                    : "Sincronizar dados"
                }
              >
                <span className="button-icon-wrapper">
                  {syncing ? (
                    <RefreshCw
                      size={18}
                      className="sync-rotating"
                    />
                  ) : syncState === "success" ? (
                    <Check size={18} />
                  ) : syncState === "error" ? (
                    <AlertCircle size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                </span>

                <span className="button-content">
                  <small>
                    {syncing
                      ? "PROCESSANDO"
                      : syncState === "success"
                        ? "CONCLUÍDO"
                        : syncState === "error"
                          ? "ATENÇÃO"
                          : "DADOS"}
                  </small>

                  <strong>
                    {syncing
                      ? "Sincronizando..."
                      : syncState === "success"
                        ? "Sincronizado!"
                        : syncState === "error"
                          ? "Tentar novamente"
                          : !isOnline
                            ? "Sem conexão"
                            : "Sincronizar"}
                  </strong>
                </span>

                {syncState === "success" && (
                  <span className="button-status">
                    <Check size={13} />
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </header>

      {syncState === "error" && (
        <div className="sync-error-panel" role="alert">
          <div className="sync-error-panel-icon">
            <AlertCircle size={20} />
          </div>

          <div className="sync-error-panel-content">
            <strong>Não foi possível sincronizar</strong>
            <span>{syncMessage}</span>
            {syncErrorDetail && syncErrorDetail !== syncMessage && (
              <code>{syncErrorDetail}</code>
            )}
          </div>

          <button
            type="button"
            className="sync-error-retry"
            onClick={handleSync}
            disabled={syncing || !isOnline}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* =====================================================
          HOME
      ====================================================== */}

      {page === "home" && (
        <Home key={`${page}-${syncRevision}`}
          onNewActivity={goToNewActivity}
          onEditActivity={goToEditActivity}
          onViewActivity={goToActivityDetails}
          onProperties={goToProperties}
          onDiary={goToDiary}
          onLibrary={goToLibrary}
          onReports={goToReports}
          onCultures={goToCultures}
          onManagement={goToManagement}
          onOrders={goToOrders}
        />
      )}

      {/* =====================================================
          NOVA ATIVIDADE
      ====================================================== */}

      {page === "newActivity" && (
        <NewActivity key={`${page}-${syncRevision}`}
          onCancel={goToHome}
          onActivityCreated={goToHome}
          activityToEdit={activityToEdit}
        />
      )}

      {/* =====================================================
          DETALHES DA ATIVIDADE
      ====================================================== */}

      {page === "activityDetails" && (
        <ActivityDetails key={`${page}-${syncRevision}`}
          activity={activityToView}
          onBack={goToHome}
          onEdit={goToEditActivity}
        />
      )}

      {/* =====================================================
          PROPRIEDADES
      ====================================================== */}

      {page === "properties" && (
        <Properties key={`${page}-${syncRevision}`}
          onNewProperty={goToNewProperty}
          onEditProperty={goToEditProperty}
          onViewPlots={goToPlots}
          onBack={goToHome}
        />
      )}

      {/* =====================================================
          NOVA PROPRIEDADE
      ====================================================== */}

      {page === "newProperty" && (
        <NewProperty key={`${page}-${syncRevision}`}
          onCancel={goToProperties}
          onPropertyCreated={
            goToPropertiesAfterSave
          }
          propertyToEdit={propertyToEdit}
        />
      )}

      {/* =====================================================
          TALHÕES
      ====================================================== */}

      {page === "plots" && (
        <Plots key={`${page}-${syncRevision}`}
          property={selectedProperty}
          onNewPlot={goToNewPlot}
          onEditPlot={goToEditPlot}
          onBack={goToProperties}
        />
      )}

      {/* =====================================================
          NOVO TALHÃO
      ====================================================== */}

      {page === "newPlot" && (
        <NewPlot key={`${page}-${syncRevision}`}
          property={selectedProperty}
          onCancel={() =>
            goToPlots(selectedProperty)
          }
          onPlotCreated={() =>
            goToPlots(selectedProperty)
          }
          plotToEdit={plotToEdit}
        />
      )}

      {/* =====================================================
          DIÁRIO
      ====================================================== */}

      {page === "diary" && (
        <Diary key={`${page}-${syncRevision}`}
          onNewActivity={goToNewActivity}
          onEditActivity={goToEditActivity}
          onViewActivity={goToActivityDetails}
          onBack={goToHome}
        />
      )}

      {/* =====================================================
          BIBLIOTECA
      ====================================================== */}

      {page === "library" && (
        <Library key={`${page}-${syncRevision}`}
          onNewProduct={goToNewProduct}
          onEditProduct={goToEditProduct}
          onBack={goToHome}
          onPests={goToPests}
          onDiseases={goToDiseases}
        />
      )}

      {/* =====================================================
          PRAGAS
      ====================================================== */}

      {page === "pests" && (
        <Pests key={`${page}-${syncRevision}`}
          onNewPest={goToNewPest}
          onEditPest={goToEditPest}
          onBack={goToLibrary}
        />
      )}

      {/* =====================================================
          NOVA PRAGA
      ====================================================== */}

      {page === "newPest" && (
        <NewPest key={`${page}-${syncRevision}`}
          onCancel={goToPests}
          onPestCreated={goToPestsAfterSave}
          pestToEdit={pestToEdit}
        />
      )}

      {/* =====================================================
          DOENÇAS
      ====================================================== */}

      {page === "diseases" && (
        <Diseases key={`${page}-${syncRevision}`}
          onNewDisease={goToNewDisease}
          onEditDisease={goToEditDisease}
          onBack={goToLibrary}
        />
      )}

      {/* =====================================================
          NOVA DOENÇA
      ====================================================== */}

      {page === "newDisease" && (
        <NewDisease key={`${page}-${syncRevision}`}
          onCancel={goToDiseases}
          onDiseaseCreated={
            goToDiseasesAfterSave
          }
          diseaseToEdit={diseaseToEdit}
        />
      )}

      {/* =====================================================
          CULTURAS
      ====================================================== */}

      {page === "cultures" && (
        <Cultures key={`${page}-${syncRevision}`}
          onNewCulture={goToNewCulture}
          onEditCulture={goToEditCulture}
          onBack={goToHome}
        />
      )}

      {/* =====================================================
          NOVA CULTURA
      ====================================================== */}

      {page === "newCulture" && (
        <NewCulture key={`${page}-${syncRevision}`}
          onCancel={goToCultures}
          onCultureCreated={
            goToCulturesAfterSave
          }
          cultureToEdit={cultureToEdit}
        />
      )}

      {/* =====================================================
          NOVO PRODUTO
      ====================================================== */}

      {page === "newProduct" && (
        <NewProduct key={`${page}-${syncRevision}`}
          onCancel={goToLibrary}
          onProductCreated={
            goToLibraryAfterSave
          }
          productToEdit={productToEdit}
        />
      )}

      {/* =====================================================
          MANEJO
      ====================================================== */}

      {page === "management" && (
        <Management key={`${page}-${syncRevision}`}
          onBack={goToHome}
        />
      )}

      {/* =====================================================
          RELATÓRIOS
      ====================================================== */}

      {page === "reports" && (
        <Reports key={`${page}-${syncRevision}`}
          onBack={goToHome}
          onBackToHome={goToHome}
        />
      )}

      {/* =====================================================
          PEDIDOS
      ====================================================== */}

      {page === "orders" && (
        <Orders key={`${page}-${syncRevision}`}
          onBack={goToHome}
          onNewOrder={goToNewOrder}
          onViewOrder={goToOrderDetails}
          onEditOrder={goToEditOrder}
        />
      )}

      {/* =====================================================
          NOVO PEDIDO
      ====================================================== */}

      {page === "new-order" && (
        <NewOrder key={`${page}-${syncRevision}`}
          onBack={goToOrders}
          onOrderCreated={goToOrders}
        />
      )}
      {page === "edit-order" && (
  <NewOrder key={`${page}-${syncRevision}`}
    orderToEdit={orderToEdit}
    onBack={goToOrders}
    onOrderCreated={goToOrders}
  />
)}

      {/* =====================================================
          DETALHES DO PEDIDO
      ====================================================== */}

      {page === "order-details" && (
        <OrderDetails key={`${page}-${syncRevision}`}
          order={orderToView}
          onBack={goToOrders}
        />
      )}

      <nav className="mobile-bottom-nav" aria-label="Navegação principal">
        <button type="button" className={page === "home" ? "active" : ""} onClick={goToHome}>
          <Sprout size={19} />
          <span>Início</span>
        </button>

        <button
          type="button"
          className={
            page === "diary" ||
            page === "newActivity" ||
            page === "activityDetails"
              ? "active"
              : ""
          }
          onClick={goToDiary}
        >
          <ClipboardList size={19} />
          <span>Atividades</span>
        </button>

        <button
          type="button"
          className={
            page === "properties" ||
            page === "plots" ||
            page === "newProperty" ||
            page === "newPlot"
              ? "active"
              : ""
          }
          onClick={goToProperties}
        >
          <Building2 size={19} />
          <span>Propriedades</span>
        </button>

        <button
          type="button"
          className={
            page === "library" ||
            page === "pests" ||
            page === "diseases" ||
            page === "newProduct" ||
            page === "newPest" ||
            page === "newDisease"
              ? "active"
              : ""
          }
          onClick={goToLibrary}
        >
          <LibraryBig size={19} />
          <span>Biblioteca</span>
        </button>

        <button
          type="button"
          className={
            page === "orders" ||
            page === "new-order" ||
            page === "edit-order" ||
            page === "order-details"
              ? "active"
              : ""
          }
          onClick={goToOrders}
        >
          <ShoppingCart size={19} />
          <span>Pedidos</span>
        </button>
      </nav>

    </div>
  );
}

export default App;