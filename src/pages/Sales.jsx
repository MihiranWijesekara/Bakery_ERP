import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { FiPlus, FiSend } from "react-icons/fi";

export const Sales = ({
  subActiveTab,
  setSubActiveTab,
  isWizardOpen,
  setIsWizardOpen,
}) => {
  const {
    salesOrders,
    customers,
    products,
    createSalesOrder,
    deliverSalesOrder,
  } = useContext(AppContext);
  const activeTab = subActiveTab || "orders";
  const setActiveTab = setSubActiveTab || (() => {});

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [itemsList, setItemsList] = useState([]);
  const [currProductId, setCurrProductId] = useState("");
  const [currQty, setCurrQty] = useState("");

  const addProductToOrder = () => {
    if (!currProductId || !currQty || Number(currQty) <= 0) return;
    const product = products.find((item) => item.id === currProductId);
    if (!product) return;

    setItemsList((prev) => {
      const existing = prev.find((item) => item.id === currProductId);
      if (existing) {
        return prev.map((item) =>
          item.id === currProductId
            ? { ...item, qty: Number(item.qty) + Number(currQty) }
            : item,
        );
      }

      return [
        ...prev,
        { id: currProductId, name: product.name, qty: Number(currQty) },
      ];
    });

    setCurrProductId("");
    setCurrQty("");
  };

  const removeItemFromOrder = (id) => {
    setItemsList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedCustomerId || itemsList.length === 0) {
      alert("Please select a customer and add at least one product.");
      return;
    }

    createSalesOrder(selectedCustomerId, itemsList);
    setIsWizardOpen(false);
    setSelectedCustomerId("");
    setItemsList([]);
  };

  const totalDraftValue = useMemo(() => {
    return itemsList.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.id);
      return sum + Number(item.qty) * Number(product?.price || 0);
    }, 0);
  }, [itemsList, products]);

  const orderColumns = [
    { header: "Date", accessor: "date", sortable: true },
    { header: "Sales Order", accessor: "soNumber", sortable: true },
    { header: "Customer", accessor: "customerName", sortable: true },
    {
      header: "Order Items",
      accessor: "items",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {row.items.map((item) => (
            <span
              key={`${row.id}-${item.id}`}
              style={{ fontSize: "11px", color: "var(--text-muted)" }}
            >
              • {item.name}: {item.qty} pcs
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Value",
      accessor: "totalAmount",
      cell: (row) => <strong>${row.totalAmount.toFixed(2)}</strong>,
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: (row) => {
        if (row.status === "Completed")
          return <span className="badge badge-success">Completed</span>;
        if (row.status === "Processing")
          return <span className="badge badge-warning">Processing</span>;
        return <span className="badge badge-primary">Pending</span>;
      },
    },
    {
      header: "Action",
      accessor: "id",
      cell: (row) =>
        row.status === "Completed" ? (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Delivered
          </span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => deliverSalesOrder(row.id)}
          >
            <FiSend /> Ship Order
          </button>
        ),
    },
  ];

  const customerColumns = [
    { header: "Customer", accessor: "name", sortable: true },
    { header: "Contact", accessor: "contact" },
    { header: "Phone", accessor: "phone" },
    { header: "Address", accessor: "address" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Sales Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
        </div>
      </div>

      {activeTab === "orders" && (
        <Table
          title="Sales Pipeline"
          columns={orderColumns}
          data={salesOrders}
          filterField="status"
          filterLabel="Status"
          filterOptions={["Pending", "Processing", "Completed"]}
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsWizardOpen(true)}
            >
              <FiPlus /> New Sales Order
            </button>
          }
        />
      )}

      {activeTab === "customers" && (
        <Table
          title="Customer Master"
          columns={customerColumns}
          data={customers}
        />
      )}

      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Create Sales Order"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsWizardOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Create Order
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Customer <span className="required-indicator">*</span>
            </label>
            <select
              className="form-control"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
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
              Add Products
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
                  Product
                </label>
                <select
                  className="form-control"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  value={currProductId}
                  onChange={(event) => setCurrProductId(event.target.value)}
                >
                  <option value="">-- Choose --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price})
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
                  placeholder="e.g. 50"
                  min="1"
                  value={currQty}
                  onChange={(event) => setCurrQty(event.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addProductToOrder}
              >
                Add
              </button>
            </div>

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
                      <th style={{ padding: "4px" }}>Product</th>
                      <th style={{ padding: "4px" }}>Qty</th>
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
                        <td style={{ padding: "6px 4px" }}>{item.qty} pcs</td>
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
                            onClick={() => removeItemFromOrder(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  style={{
                    marginTop: "12px",
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  Draft value: ${totalDraftValue.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};
