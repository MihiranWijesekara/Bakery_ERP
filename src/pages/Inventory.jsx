import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { FiPlus, FiAlertTriangle, FiTrash2, FiEdit2 } from "react-icons/fi";

export const Inventory = ({
  subActiveTab,
  setSubActiveTab,
  isProductModalOpen,
  setIsProductModalOpen,
}) => {
  const {
    rawMaterials,
    setRawMaterials,
    wasteLogs,
    addWaste,
    updateWasteLog,
    updateProductionLog,
    updatePurchaseOrder,
    addProduct,
    productionLogs,
    purchaseOrders,
  } = useContext(AppContext);

  const activeTab = subActiveTab || "materials";
  const setActiveTab = setSubActiveTab || (() => {});

  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isProductModalOpenLocal, setIsProductModalOpenLocal] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Buns");
  const [prodPrice, setProdPrice] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodStock, setProdStock] = useState("0");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialUnit, setNewMaterialUnit] = useState("kg");
  const [newMaterialMinStock, setNewMaterialMinStock] = useState("0");
  const [editingRecord, setEditingRecord] = useState(null);
  const [editType, setEditType] = useState("");
  const [editForm, setEditForm] = useState({});

  const productModalOpen = isProductModalOpen ?? isProductModalOpenLocal;
  const setProductModalOpen =
    setIsProductModalOpen ?? setIsProductModalOpenLocal;
  const [rawMaterial, setRawMaterial] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [unitCostPrice, setUnitCostPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [creationDate, setCreationDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [wasteReason, setWasteReason] = useState("Expired");
  const [otherWasteReason, setOtherWasteReason] = useState("");
  const selectedMaterial = rawMaterials.find((rm) => rm.id === rawMaterial);
  const quantityStep = selectedMaterial?.unit === "pcs" ? "1" : "0.01";
  const displayedIngredients = rawMaterials.filter((material) =>
    [
      "rm_flour",
      "rm_sugar",
      "rm_eggs",
      "rm_fish",
      "rm_onion",
      "rm_tomato",
    ].includes(material.id),
  );

  const openMaterialEditor = (materialId) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    if (!material) return;
    setEditType("material");
    setEditingRecord(material);
    setEditForm({ ...material });
  };

  const openEditor = (type, record) => {
    setEditType(type);
    setEditingRecord(record);
    setEditForm({ ...record });
  };

  const closeEditor = () => {
    setEditingRecord(null);
    setEditType("");
    setEditForm({});
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const form = editForm;
    if (editType === "material") {
      const name = String(form.name || "").trim();
      const stock = Number(form.stock);
      const minStock = Number(form.minStock);
      const cost = Number(form.cost);
      if (!name || stock < 0 || minStock < 0 || cost < 0) return;
      setRawMaterials((prev) =>
        prev.map((rm) =>
          rm.id === editingRecord.id
            ? { ...rm, name, stock, minStock, cost, unit: form.unit }
            : rm,
        ),
      );
    } else if (editType === "purchase") {
      const purchase = purchaseOrders.find(
        (po) => po.id === editingRecord.sourceId,
      );
      if (!purchase) return;
      const items = purchase.items.map((item, index) =>
        index === editingRecord.itemIndex
          ? {
              ...item,
              qty: Number(form.qty),
              unitPrice: Number(form.unitPrice),
            }
          : item,
      );
      const updated = updatePurchaseOrder(
        purchase.id,
        purchase.supplierId,
        items,
        form.date,
      );
      if (!updated) return;
    } else if (editType === "waste") {
      if (
        !updateWasteLog(editingRecord.id, {
          date: form.date,
          qty: Number(form.qty),
          reason: form.reason,
          unitCostPrice: Number(form.unitCostPrice),
          totalPrice: Number(form.totalPrice),
        })
      )
        return;
    } else if (editType === "production" || editType === "variance") {
      const production = productionLogs.find(
        (log) =>
          log.id === editingRecord.batchId || log.id === editingRecord.sourceId,
      );
      if (!production) return;
      const hasMaterial = production.actualMaterials.some(
        (material) => material.id === editingRecord.materialId,
      );
      const actualMaterials = production.actualMaterials
        .map((material) =>
          material.id === editingRecord.materialId
            ? { ...material, qty: Number(form.qty) }
            : material,
        )
        .concat(
          hasMaterial
            ? []
            : [
                {
                  id: editingRecord.materialId,
                  name: editingRecord.material,
                  qty: Number(form.qty),
                  unit: editingRecord.unit || "kg",
                },
              ],
        );
      if (
        !updateProductionLog(production.id, {
          date: form.date,
          actualMaterials,
        })
      )
        return;
    }
    closeEditor();
  };

  const handleDeleteMaterial = (materialId) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    if (!material) return;

    const confirmed = window.confirm(
      `Delete ${material.name} from raw materials?`,
    );
    if (!confirmed) return;

    setRawMaterials((prev) => prev.filter((rm) => rm.id !== materialId));
  };

  // Submit Waste Form
  const handleWasteSubmit = (e) => {
    e.preventDefault();
    const reason =
      wasteReason === "Other" ? otherWasteReason.trim() : wasteReason;
    if (
      !rawMaterial ||
      !totalQuantity ||
      Number(totalQuantity) <= 0 ||
      !unitCostPrice ||
      Number(unitCostPrice) <= 0 ||
      !totalPrice ||
      Number(totalPrice) <= 0 ||
      !reason
    ) {
      alert("Please fill all required fields correctly.");
      return;
    }
    addWaste(rawMaterial, Number(totalQuantity), reason, {
      unitCostPrice: Number(unitCostPrice),
      totalPrice: Number(totalPrice),
      expiryDate: expiryDate || null,
      creationDate,
    });
    setIsWasteModalOpen(false);
    setRawMaterial("");
    setTotalQuantity("");
    setUnitCostPrice("");
    setTotalPrice("");
    setExpiryDate("");
    setCreationDate(new Date().toISOString().split("T")[0]);
    setWasteReason("Expired");
    setOtherWasteReason("");
  };

  const handleCreateMaterial = (e) => {
    e.preventDefault();

    const trimmedName = newMaterialName.trim();
    const parsedMinStock = Number(newMaterialMinStock);
    const normalizedUnit = newMaterialUnit.trim();

    if (!trimmedName || !normalizedUnit || !Number.isFinite(parsedMinStock)) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    if (parsedMinStock < 0) {
      alert("Minimum stock level cannot be negative.");
      return;
    }

    const nameExists = rawMaterials.some(
      (rm) => rm.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (nameExists) {
      alert("A raw material with this name already exists.");
      return;
    }

    const materialId = `rm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setRawMaterials((prev) => [
      {
        id: materialId,
        name: trimmedName,
        stock: 0,
        unit: normalizedUnit,
        minStock: parsedMinStock,
        cost: 0,
        category: "Custom",
        expiryDate: null,
      },
      ...prev,
    ]);

    setIsMaterialModalOpen(false);
    setNewMaterialName("");
    setNewMaterialUnit("kg");
    setNewMaterialMinStock("0");
  };

  // 1. Raw Materials Table Setup
  const materialColumns = [
    { header: "Material Name", accessor: "name", sortable: true },
    {
      header: "Stock Level",
      accessor: "stock",
      sortable: true,
      cell: (row) => (
        <strong
          style={{
            color:
              row.stock === 0
                ? "var(--danger)"
                : row.stock < row.minStock
                  ? "var(--warning)"
                  : "inherit",
          }}
        >
          {row.stock} {row.unit}
        </strong>
      ),
    },
    { header: "Min Stock Limit", accessor: "minStock" },
    {
      header: "Cost per Unit",
      accessor: "cost",
      cell: (row) => `$${Number(row.cost || 0).toFixed(2)}`,
    },
    {
      header: "Total Price",
      accessor: "totalPrice",
      cell: (row) => `$${((row.stock || 0) * (row.cost || 0)).toFixed(2)}`,
    },
    {
      header: "Action",
      accessor: "id",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openMaterialEditor(row.id)}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteMaterial(row.id)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      ),
    },
  ];

  // 2. Finished Goods Table Setup
  const productColumns = [
    { header: "Material Name", accessor: "name", sortable: true },
    { header: "UNIT", accessor: "unit", sortable: true },
    {
      header: "Min Stock Level",
      accessor: "minStock",
      sortable: true,
      cell: (row) => `${row.minStock} ${row.unit}`,
    },
    {
      header: "Action",
      accessor: "id",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openMaterialEditor(row.id)}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteMaterial(row.id)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      ),
    },
  ];

  // 3. Waste Logs Table Setup
  const wasteColumns = [
    { header: "Date Logged", accessor: "date", sortable: true },
    { header: "Material", accessor: "materialName", sortable: true },
    {
      header: "Quantity Discarded",
      accessor: "qty",
      cell: (row) => `${row.qty} ${row.unit}`,
    },
    { header: "Reason", accessor: "reason", sortable: true },
    {
      header: "Loss Cost",
      accessor: "cost",
      cell: (row) => `$${row.cost.toFixed(2)}`,
    },
    { header: "Logged By", accessor: "loggedBy" },
    {
      header: "Action",
      accessor: "id",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openEditor("waste", row)}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteMaterial(row.id)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      ),
    },
  ];

  // 4. Daily Raw Materials Transactions (IN / OUT)
  const dailyTransactionData = React.useMemo(() => {
    const transactions = [];
    const materialCostMap = new Map(rawMaterials.map((rm) => [rm.id, rm.cost]));

    purchaseOrders.forEach((po) => {
      po.items.forEach((item, index) => {
        const unitPrice = Number(item.unitPrice ?? item.cost ?? 0);
        const qty = Number(item.qty || 0);
        transactions.push({
          id: `txn_po_${po.id}_${item.id}_${index}`,
          date: po.date,
          materialName: item.name,
          direction: "IN",
          qty,
          unit: item.unit,
          unitPrice,
          totalPrice: Number((qty * unitPrice).toFixed(2)),
          source: "Purchase",
          reference: po.poNumber,
          sourceId: po.id,
          itemIndex: index,
        });
      });
    });

    productionLogs.forEach((run) => {
      run.actualMaterials.forEach((material, index) => {
        const unitPrice = Number(materialCostMap.get(material.id) || 0);
        const qty = Number(material.qty || 0);
        transactions.push({
          id: `txn_pr_${run.id}_${material.id}_${index}`,
          date: run.date,
          materialName: material.name,
          direction: "OUT",
          qty,
          unit: material.unit,
          unitPrice,
          totalPrice: Number((qty * unitPrice).toFixed(2)),
          source: "Production",
          reference: run.id,
          sourceId: run.id,
          materialId: material.id,
        });
      });
    });

    wasteLogs.forEach((log) => {
      const qty = Number(log.qty || 0);
      const unitPrice = Number(
        log.unitCostPrice ?? (qty > 0 ? Number(log.cost || 0) / qty : 0),
      );
      transactions.push({
        id: `txn_waste_${log.id}`,
        date: log.date,
        materialName: log.materialName,
        direction: "OUT",
        qty,
        unit: log.unit,
        unitPrice,
        totalPrice: Number((qty * unitPrice).toFixed(2)),
        source: "Waste",
        reference: log.reason,
        sourceId: log.id,
      });
    });

    return transactions.sort((a, b) => b.date.localeCompare(a.date));
  }, [purchaseOrders, productionLogs, wasteLogs, rawMaterials]);

  const transactionColumns = [
    { header: "Date", accessor: "date", sortable: true },
    { header: "Material", accessor: "materialName", sortable: true },
    {
      header: "Type",
      accessor: "direction",
      sortable: true,
      cell: (row) => (
        <span
          className={`badge ${row.direction === "IN" ? "badge-success" : "badge-danger"}`}
        >
          {row.direction}
        </span>
      ),
    },
    {
      header: "Quantity",
      accessor: "qty",
      sortable: true,
      cell: (row) => `${row.qty} ${row.unit}`,
    },
    {
      header: "Unit Cost",
      accessor: "unitPrice",
      sortable: true,
      cell: (row) => `$${Number(row.unitPrice || 0).toFixed(2)}`,
    },
    {
      header: "Total Value",
      accessor: "totalPrice",
      sortable: true,
      cell: (row) =>
        `${row.direction === "OUT" ? "-" : "+"}$${Number(row.totalPrice || 0).toFixed(2)}`,
    },

    // add the edit and delete button in this area
    {
      header: "Action",
      accessor: "id",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              openEditor(
                row.source === "Purchase" ? "purchase" : "production",
                row,
              )
            }
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteMaterial(row.id)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      ),
    },
  ];

  // 5. Variance Reporting Calculation
  const varianceData = React.useMemo(() => {
    const list = [];
    productionLogs
      .filter((p) => p.status === "Completed")
      .forEach((run) => {
        run.expectedMaterials.forEach((exp) => {
          const act = run.actualMaterials.find((a) => a.id === exp.id) || {
            qty: 0,
          };
          const diff = Number((act.qty - exp.qty).toFixed(2));
          list.push({
            id: `${run.id}_${exp.id}`,
            date: run.date,
            batchId: run.id,
            product: run.productName,
            material: exp.name,
            materialId: exp.id,
            sourceId: run.id,
            qty: Number(act.qty || 0),
            expected: `${exp.qty} ${exp.unit}`,
            actual: `${act.qty} ${exp.unit}`,
            varianceVal: diff,
            varianceText:
              diff === 0
                ? "0"
                : diff > 0
                  ? `+${diff} ${exp.unit}`
                  : `${diff} ${exp.unit}`,
            percentage:
              exp.qty > 0 ? ((diff / exp.qty) * 100).toFixed(1) + "%" : "0%",
          });
        });
      });
    return list;
  }, [productionLogs]);

  const varianceColumns = [
    { header: "Production Date", accessor: "date", sortable: true },

    { header: "Raw Material", accessor: "material", sortable: true },
    { header: "Actual Consumption", accessor: "actual" },
    { header: "Expected Consumption", accessor: "expected" },
    {
      header: "Difference (Variance)",
      accessor: "varianceVal",
      cell: (row) => (
        <span
          style={{
            color:
              row.varianceVal > 0
                ? "var(--danger)"
                : row.varianceVal < 0
                  ? "var(--success)"
                  : "inherit",
            fontWeight: 600,
          }}
        >
          {row.varianceText} ({row.percentage})
        </span>
      ),
    },
  ];

  return (
    <div
      className="inventory-page"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      {/* Navigation Tabs Header */}
      <div className="tabs-container">
        <div className="tabs-list inventory-tabs">
          <button
            className={`tab-btn ${activeTab === "materials" ? "active" : ""}`}
            onClick={() => setActiveTab("materials")}
          >
            Raw Materials Stock
          </button>
          <button
            className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Daily Raw Materials Transactions
          </button>
          <button
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Raw Materials
          </button>
          <button
            className={`tab-btn ${activeTab === "waste" ? "active" : ""}`}
            onClick={() => setActiveTab("waste")}
          >
            Waste Spoilage Logs
          </button>
          <button
            className={`tab-btn ${activeTab === "variance" ? "active" : ""}`}
            onClick={() => setActiveTab("variance")}
          >
            Consumption Variance Report
          </button>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {rawMaterials.some((r) => r.stock < r.minStock) &&
        activeTab === "materials" && (
          <div
            style={{
              backgroundColor: "var(--danger-light)",
              borderLeft: "4px solid var(--danger)",
              borderRadius: "var(--border-radius-sm)",
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--danger)",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            <FiAlertTriangle size={18} />
            <span>
              Critical Warning: Several bakery ingredients have fallen below
              safety limits. Please review reorder levels.
            </span>
          </div>
        )}

      {/* Tab Panels */}
      {activeTab === "materials" && (
        <Table
          title="Raw Materials Master Stock"
          columns={materialColumns}
          data={rawMaterials}
        />
      )}

      {activeTab === "transactions" && (
        <Table
          title="Daily Raw Materials Transactions"
          columns={transactionColumns}
          data={dailyTransactionData}
          filterField="direction"
          filterLabel="Transaction Type"
          filterOptions={["IN", "OUT"]}
          dateFilterField="date"
          searchPlaceholder="Search material, source, or reference..."
        />
      )}

      {activeTab === "products" && (
        <Table
          title="Raw Materials (Ingredients)"
          columns={productColumns}
          data={displayedIngredients}
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsMaterialModalOpen(true)}
            >
              <FiPlus /> Add New Raw Material
            </button>
          }
        />
      )}

      {activeTab === "waste" && (
        <Table
          title="Wastage & Spoilage Register"
          columns={wasteColumns}
          data={wasteLogs}
          filterField="reason"
          filterLabel="Reason"
          filterOptions={["Expired", "Damaged", "Spilled", "Dough Spoiled"]}
          dateFilterField="date"
          actions={
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setIsWasteModalOpen(true)}
            >
              <FiPlus /> Record Waste
            </button>
          }
        />
      )}

      {activeTab === "variance" && (
        <Table
          title="Consumption Comparison Variance Report"
          columns={varianceColumns}
          data={varianceData}
          dateFilterField="date"
          searchPlaceholder="Search products or ingredients..."
        />
      )}

      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={closeEditor}
        title={`Edit ${editType === "material" ? "Raw Material" : editType === "purchase" ? "Purchase Transaction" : editType === "waste" ? "Waste Log" : "Production Consumption"}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeEditor}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEditSubmit}>
              Save Changes
            </button>
          </>
        }
      >
        {editingRecord && (
          <form onSubmit={handleEditSubmit}>
            {editType === "material" && (
              <>
                <div className="form-group">
                  <label className="form-label">Material Name</label>
                  <input
                    className="form-control"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={editForm.stock ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={editForm.minStock ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, minStock: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost per Unit</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={editForm.cost ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cost: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
            {(editType === "purchase" ||
              editType === "production" ||
              editType === "variance" ||
              editType === "waste") && (
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editForm.date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  required
                />
              </div>
            )}
            {(editType === "purchase" ||
              editType === "production" ||
              editType === "variance" ||
              editType === "waste") && (
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  value={editForm.qty ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, qty: e.target.value })
                  }
                  required
                />
              </div>
            )}
            {editType === "purchase" && (
              <div className="form-group">
                <label className="form-label">Unit Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={editForm.unitPrice ?? ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, unitPrice: e.target.value })
                  }
                  required
                />
              </div>
            )}
            {editType === "waste" && (
              <>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    className="form-control"
                    value={editForm.reason || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, reason: e.target.value })
                    }
                  >
                    <option>Expired</option>
                    <option>Damaged</option>
                    <option>Spilled</option>
                    <option>Dough Spoiled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={editForm.unitCostPrice ?? ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        unitCostPrice: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Loss</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={editForm.totalPrice ?? editForm.cost ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalPrice: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
          </form>
        )}
      </Modal>

      {/* Add Raw Material Modal */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Add New Raw Material"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsMaterialModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-blue" onClick={handleCreateMaterial}>
              Save Material
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateMaterial}>
          <div className="form-group">
            <label className="form-label">
              Material Name <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="e.g. Wheat Flour"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Unit <span className="required-indicator">*</span>
            </label>
            <select
              className="form-control"
              value={newMaterialUnit}
              onChange={(e) => setNewMaterialUnit(e.target.value)}
              required
            >
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="pcs">pcs</option>
              <option value="boxes">boxes</option>
              <option value="bags">bags</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Min Stock Level <span className="required-indicator">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              value={newMaterialMinStock}
              onChange={(e) => setNewMaterialMinStock(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Waste Registration Modal */}
      <Modal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        title="Record Waste"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsWasteModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleWasteSubmit}>
              Save Waste
            </button>
          </>
        }
      >
        <form onSubmit={handleWasteSubmit}>
          <div className="form-group">
            <label className="form-label">
              Material <span className="required-indicator">*</span>
            </label>
            <select
              className="form-control"
              value={rawMaterial}
              onChange={(e) => setRawMaterial(e.target.value)}
              required
            >
              <option value="">-- Choose Material --</option>
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.name} (Stock: {rm.stock} {rm.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Quantity Discarded ({selectedMaterial?.unit || "unit"}){" "}
              <span className="required-indicator">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              placeholder={`e.g. ${selectedMaterial?.unit === "pcs" ? "6" : "5.5"}`}
              step={quantityStep}
              min={quantityStep}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Reason <span className="required-indicator">*</span>
            </label>
            <select
              className="form-control"
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
              required
            >
              <option value="Expired">Expired</option>
              <option value="Damaged">Damaged</option>
              <option value="Spilled">Spilled</option>
              <option value="Dough Spoiled">Dough Spoiled</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {wasteReason === "Other" && (
            <div className="form-group">
              <label className="form-label">
                Reason Details <span className="required-indicator">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter the waste reason"
                value={otherWasteReason}
                onChange={(e) => setOtherWasteReason(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Unit Cost Price <span className="required-indicator">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="0.01"
              step="0.01"
              value={unitCostPrice}
              onChange={(e) => setUnitCostPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Total Loss Cost <span className="required-indicator">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="0.01"
              step="0.01"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
