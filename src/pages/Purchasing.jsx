import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { FiPlus, FiCheck, FiTruck, FiShoppingBag } from "react-icons/fi";

export const Purchasing = ({
  subActiveTab,
  setSubActiveTab,
  isWizardOpen,
  setIsWizardOpen,
  isNewSupplierOpen,
  setIsNewSupplierOpen,
  isNewSupplierChooseOpen,
  setIsNewSupplierChooseOpen,
  iscompanyVendorOpen,
  setIscompanyVendorOpen,
  isPersonVendorOpen,
  setIsPersonVendorOpen,
}) => {
  const {
    purchaseOrders,
    suppliers,
    rawMaterials,
    createPurchaseOrder,
    approvePurchaseOrder,
    receivePurchaseOrder,
  } = useContext(AppContext);

  const activeTab = subActiveTab || "orders";
  const setActiveTab = setSubActiveTab || (() => {});

  // PO creation form state
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [itemsList, setItemsList] = useState([]);

  // // New supplier form state
  // const [newSupplierName, setNewSupplierName] = useState("");
  // const [newSupplierContact, setNewSupplierContact] = useState("");
  // const [newSupplierPhone, setNewSupplierPhone] = useState("");
  // const [newSupplierAddress, setNewSupplierAddress] = useState("");
  // const [newSupplierItems, setNewSupplierItems] = useState("");

  // Company vendor creation form state
  const [companyVendorName, setCompanyVendorName] = useState("");
  const [companyVendorEmail, setCompanyVendorEmail] = useState("");
  const [companyVendorPhone, setCompanyVendorPhone] = useState("");
  const [companyVendorAddress, setCompanyVendorAddress] = useState("");
  const [companyVendorTaxId, setCompanyVendorTaxId] = useState("");

  // Person vendor creation form state
  const [personVendorFirstName, setPersonVendorFirstName] = useState("");
  const [personVendorJobPosition, setPersonVendorJobPosition] = useState("");
  const [personVendorCompany, setPersonVendorCompany] = useState("");
  const [personVendorEmail, setPersonVendorEmail] = useState("");
  const [personVendorPhone, setPersonVendorPhone] = useState("");
  const [personVendorAddress, setPersonVendorAddress] = useState("");
  const [personVendorTaxId, setPersonVendorTaxId] = useState("");

  // New supplier choose form state
  const [newSupplierChooseType, setNewSupplierChooseType] = useState("");

  // Select material to add to current PO
  const [currRmId, setCurrRmId] = useState("");
  const [currQty, setCurrQty] = useState("");

  const addMaterialToPO = () => {
    if (!currRmId || !currQty || Number(currQty) <= 0) return;
    const material = rawMaterials.find((r) => r.id === currRmId);
    if (!material) return;

    // Check if item already exists
    if (itemsList.some((item) => item.id === currRmId)) {
      setItemsList((prev) =>
        prev.map((item) => {
          if (item.id === currRmId) {
            return { ...item, qty: Number(item.qty) + Number(currQty) };
          }
          return item;
        }),
      );
    } else {
      setItemsList((prev) => [
        ...prev,
        { id: currRmId, name: material.name, qty: Number(currQty) },
      ]);
    }

    setCurrRmId("");
    setCurrQty("");
  };

  const removeItemFromPO = (id) => {
    setItemsList((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePOSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId || itemsList.length === 0) {
      alert("Please select a supplier and add at least one material.");
      return;
    }

    createPurchaseOrder(selectedSupplierId, itemsList);
    setIsWizardOpen(false);
    setSelectedSupplierId("");
    setItemsList([]);
  };

  const handleNewSupplierSubmit = (e) => {
    e.preventDefault();
    // Logic to create a new supplier
    // You can call a function from context or API to save the new supplier
    setIsNewSupplierOpen(false);
  };

  const handleCreateCompanyVendor = (e) => {
    e?.preventDefault?.();
    setIscompanyVendorOpen(false);
    setCompanyVendorName("");
    setCompanyVendorEmail("");
    setCompanyVendorPhone("");
    setCompanyVendorAddress("");
    setCompanyVendorTaxId("");
  };

  const handleCreatePersonVendor = (e) => {
    e?.preventDefault?.();
    setIsPersonVendorOpen(false);
    setPersonVendorFirstName("");
    setPersonVendorJobPosition("");
    setPersonVendorCompany("");
    setPersonVendorEmail("");
    setPersonVendorPhone("");
    setPersonVendorAddress("");
    setPersonVendorTaxId("");
  };

  const handleSupplierTypeSubmit = (e) => {
    e.preventDefault();
    if (!newSupplierChooseType) return;

    setIsNewSupplierChooseOpen(false);
    if (newSupplierChooseType === "company") {
      setIscompanyVendorOpen(true);
    } else {
      setIsPersonVendorOpen(true);
    }
  };

  const poColumns = [
    { header: "PO Date", accessor: "date", sortable: true },
    { header: "PO Number", accessor: "poNumber", sortable: true },
    { header: "Supplier", accessor: "supplierName", sortable: true },
    {
      header: "Items Details",
      accessor: "id",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {row.items.map((item, i) => (
            <span
              key={i}
              style={{ fontSize: "11px", color: "var(--text-muted)" }}
            >
              • {item.name}: {item.qty} pcs ($
              {(item.cost * item.qty).toFixed(2)})
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Total Value",
      accessor: "totalAmount",
      cell: (row) => <strong>${row.totalAmount.toFixed(2)}</strong>,
    },
    // {
    //   header: "Status",
    //   accessor: "status",
    //   sortable: true,
    //   cell: (row) => {
    //     if (row.status === "Received")
    //       return <span className="badge badge-success">Received</span>;
    //     if (row.status === "Ordered")
    //       return <span className="badge badge-primary">Ordered</span>;
    //     return <span className="badge badge-warning">Pending Approval</span>;
    //   },
    // },
    // {
    //   header: "Actions",
    //   accessor: "id",
    //   cell: (row) => {
    //     if (row.status === "Pending Approval") {
    //       return (
    //         <button
    //           className="btn btn-success btn-sm"
    //           onClick={() => approvePurchaseOrder(row.id)}
    //         >
    //           <FiCheck /> Approve
    //         </button>
    //       );
    //     }
    //     if (row.status === "Ordered") {
    //       return (
    //         <button
    //           className="btn btn-primary btn-sm"
    //           onClick={() => receivePurchaseOrder(row.id)}
    //         >
    //           <FiTruck /> Receive Goods
    //         </button>
    //       );
    //     }
    //     return (
    //       <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
    //         Received ({row.deliveryDate})
    //       </span>
    //     );
    //   },
    // },
  ];

  const supplierColumns = [
    { header: "Supplier Name", accessor: "name", sortable: true },
    { header: "Contact Person", accessor: "contact" },
    { header: "Telephone", accessor: "phone" },
    { header: "Address", accessor: "address" },
    {
      header: "Supplied Goods",
      accessor: "items",
      cell: (row) => (
        <span
          style={{
            fontSize: "11px",
            padding: "3px 8px",
            backgroundColor: "var(--background)",
            borderRadius: "4px",
            border: "1px solid var(--surface-border)",
          }}
        >
          {row.items}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Purchase Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "suppliers" ? "active" : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            Suppliers Registry
          </button>
        </div>
      </div>

      {activeTab === "orders" && (
        <Table
          title="Procurement Operations Log"
          columns={poColumns}
          data={purchaseOrders}
          filterField="status"
          filterLabel="Status"
          filterOptions={["Pending Approval", "Ordered", "Received"]}
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsWizardOpen(true)}
            >
              <FiShoppingBag /> Raise New Purchase Order
            </button>
          }
        />
      )}

      {activeTab === "suppliers" && (
        <Table
          title="Bakery Materials Suppliers"
          columns={supplierColumns}
          data={suppliers}
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsNewSupplierChooseOpen(true)}
            >
              <FiShoppingBag /> Create New Supplier
            </button>
          }
        />
      )}
      {/*  new supplier choose model  */}
      <Modal
        isOpen={isNewSupplierChooseOpen}
        onClose={() => setIsNewSupplierChooseOpen(false)}
        title="Choose Supplier Type"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewSupplierChooseOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSupplierTypeSubmit}
              disabled={!newSupplierChooseType}
            >
              Continue
            </button>
          </>
        }
      >
        <form onSubmit={handleSupplierTypeSubmit}>
          <div style={{ display: "grid", gap: "14px" }}>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(59, 130, 246, 0.03))",
                border: "1px solid rgba(59, 130, 246, 0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                <FiPlus />
                Select the supplier type to continue
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Choose company for a business supplier or person for an
                individual contact.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              <label
                style={{
                  cursor: "pointer",
                  padding: "16px",
                  borderRadius: "16px",
                  border:
                    newSupplierChooseType === "company"
                      ? "1.5px solid #0ea5e9"
                      : "1px solid var(--surface-border)",
                  background:
                    newSupplierChooseType === "company"
                      ? "linear-gradient(180deg, rgba(14, 165, 233, 0.14), rgba(255,255,255,0.94))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))",
                  boxShadow:
                    newSupplierChooseType === "company"
                      ? "0 14px 28px rgba(14, 165, 233, 0.16)"
                      : "0 10px 22px rgba(15, 23, 42, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <input
                  type="radio"
                  name="supplierType"
                  value="company"
                  checked={newSupplierChooseType === "company"}
                  onChange={() => setNewSupplierChooseType("company")}
                  style={{ alignSelf: "flex-start" }}
                />
                <div style={{ fontWeight: 700, fontSize: "15px" }}>
                  Add Company
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  For registered vendors, firms, and suppliers with a company
                  name.
                </div>
              </label>

              <label
                style={{
                  cursor: "pointer",
                  padding: "16px",
                  borderRadius: "16px",
                  border:
                    newSupplierChooseType === "person"
                      ? "1.5px solid #0ea5e9"
                      : "1px solid var(--surface-border)",
                  background:
                    newSupplierChooseType === "person"
                      ? "linear-gradient(180deg, rgba(14, 165, 233, 0.14), rgba(255,255,255,0.94))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.92))",
                  boxShadow:
                    newSupplierChooseType === "person"
                      ? "0 14px 28px rgba(14, 165, 233, 0.16)"
                      : "0 10px 22px rgba(15, 23, 42, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <input
                  type="radio"
                  name="supplierType"
                  value="person"
                  checked={newSupplierChooseType === "person"}
                  onChange={() => setNewSupplierChooseType("person")}
                  style={{ alignSelf: "flex-start" }}
                />
                <div style={{ fontWeight: 700, fontSize: "15px" }}>
                  Add Person
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  For individual suppliers, agents, or direct contacts.
                </div>
              </label>
            </div>
          </div>
        </form>
      </Modal>
      {/*  new supplier creation model  */}
      <Modal
        isOpen={isNewSupplierOpen}
        onClose={() => setIsNewSupplierOpen(false)}
        title="Create New Supplier"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsNewSupplierOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleNewSupplierSubmit}
            >
              Submit Supplier
            </button>
          </>
        }
      >
        <form>
          <div className="form-group">
            <label className="form-label">
              Supplier Name <span className="required-indicator">*</span>
            </label>
            <input type="text" className="form-control" required />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input type="text" className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Telephone</label>
            <input type="text" className="form-control" />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-control" rows="3"></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Supplied Goods</label>
            <input type="text" className="form-control" />
          </div>
        </form>
      </Modal>

      {/* PO Creation Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Raise New Purchase Order"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsWizardOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handlePOSubmit}>
              Submit PO
            </button>
          </>
        }
      >
        <form onSubmit={handlePOSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Material Supplier{" "}
              <span className="required-indicator">*</span>
            </label>
            <select
              className="form-control"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              required
            >
              <option value="">-- Choose Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--background)",
              borderRadius: "var(--border-radius-md)",
              marginBottom: "16px",
            }}
          >
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Add Ingredients
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr auto",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "11px" }}>
                  Raw Material
                </label>
                <select
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  value={currRmId}
                  onChange={(e) => setCurrRmId(e.target.value)}
                >
                  <option value="">-- Choose --</option>
                  {rawMaterials.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} (${rm.cost}/{rm.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "11px" }}>
                  Quantity
                </label>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  placeholder="e.g. 100"
                  min="1"
                  value={currQty}
                  onChange={(e) => setCurrQty(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addMaterialToPO}
              >
                Add
              </button>
            </div>

            {/* List of items in current PO draft */}
            {itemsList.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <table
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      <th style={{ padding: "4px" }}>Material</th>
                      <th style={{ padding: "4px" }}>Qty Requested</th>
                      <th style={{ padding: "4px", textAlign: "right" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px dotted var(--surface-border)",
                        }}
                      >
                        <td style={{ padding: "6px 4px" }}>{item.name}</td>
                        <td style={{ padding: "6px 4px" }}>{item.qty} units</td>
                        <td style={{ padding: "6px 4px", textAlign: "right" }}>
                          <button
                            type="button"
                            style={{
                              color: "var(--danger)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            onClick={() => removeItemFromPO(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
      </Modal>
      {/* create the Person vendor modal */}
      <Modal
        isOpen={isPersonVendorOpen}
        onClose={() => setIsPersonVendorOpen(false)}
        title="Create New Person Vendor"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsPersonVendorOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreatePersonVendor}
            >
              Create Vendor
            </button>
          </>
        }
      >
        <form>
          <div className="form-group">
            <label className="form-label">
              Name <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorFirstName}
              onChange={(e) => setPersonVendorFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Job Position <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorJobPosition}
              onChange={(e) => setPersonVendorJobPosition(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Company <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorCompany}
              onChange={(e) => setPersonVendorCompany(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Email <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorEmail}
              onChange={(e) => setPersonVendorEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Phone <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorPhone}
              onChange={(e) => setPersonVendorPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Address <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorAddress}
              onChange={(e) => setPersonVendorAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Tax ID <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={personVendorTaxId}
              onChange={(e) => setPersonVendorTaxId(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* create the company vendor modal */}
      <Modal
        isOpen={iscompanyVendorOpen}
        onClose={() => setIscompanyVendorOpen(false)}
        title="Create New Company Vendor"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIscompanyVendorOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateCompanyVendor}
            >
              Create Vendor
            </button>
          </>
        }
      >
        <form>
          <div className="form-group">
            <label className="form-label">
              Company Name <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={companyVendorName}
              onChange={(e) => setCompanyVendorName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Email <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={companyVendorEmail}
              onChange={(e) => setCompanyVendorEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Phone <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={companyVendorPhone}
              onChange={(e) => setCompanyVendorPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Address <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={companyVendorAddress}
              onChange={(e) => setCompanyVendorAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Tax ID <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={companyVendorTaxId}
              onChange={(e) => setCompanyVendorTaxId(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
