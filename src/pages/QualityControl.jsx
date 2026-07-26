import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { FiCheckCircle, FiPlus, FiXCircle } from "react-icons/fi";

export const QualityControl = ({ subActiveTab, setSubActiveTab }) => {
  const { qualityLogs, productionLogs, addQualityLog, updateQualityLogStatus } =
    useContext(AppContext);
  const activeTab = subActiveTab || "logs";
  const setActiveTab = setSubActiveTab || (() => {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productionId, setProductionId] = useState("");
  const [productName, setProductName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantityInspected, setQuantityInspected] = useState("");
  const [passed, setPassed] = useState("");
  const [failed, setFailed] = useState("");
  const [inspector, setInspector] = useState("John Doe (QC Supervisor)");
  const [notes, setNotes] = useState("");

  const logsColumns = [
    { header: "Date", accessor: "date", sortable: true },
    { header: "Batch No.", accessor: "batchNumber", sortable: true },
    { header: "Product", accessor: "productName", sortable: true },
    {
      header: "Inspected",
      accessor: "quantityInspected",
      cell: (row) => `${row.quantityInspected} pcs`,
    },
    {
      header: "Passed",
      accessor: "passed",
      cell: (row) => (
        <span style={{ color: "var(--success)", fontWeight: 700 }}>
          {row.passed}
        </span>
      ),
    },
    {
      header: "Failed",
      accessor: "failed",
      cell: (row) => (
        <span style={{ color: "var(--danger)", fontWeight: 700 }}>
          {row.failed}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: (row) => {
        if (row.status === "Approved")
          return <span className="badge badge-success">Approved</span>;
        if (row.status === "Rejected")
          return <span className="badge badge-danger">Rejected</span>;
        return <span className="badge badge-warning">Pending</span>;
      },
    },
    {
      header: "Action",
      accessor: "id",
      cell: (row) => {
        if (row.status === "Pending") {
          return (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-success btn-sm"
                onClick={() => updateQualityLogStatus(row.id, "Approved")}
              >
                <FiCheckCircle /> Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  updateQualityLogStatus(
                    row.id,
                    "Rejected",
                    "Batch rejected during review.",
                  )
                }
              >
                <FiXCircle /> Reject
              </button>
            </div>
          );
        }

        return (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Reviewed
          </span>
        );
      },
    },
  ];

  const productionOptions = useMemo(
    () =>
      productionLogs.map((batch) => ({
        id: batch.id,
        label: `${batch.productName} (#${batch.id.substring(3, 8)})`,
      })),
    [productionLogs],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !productName ||
      !batchNumber ||
      !quantityInspected ||
      !passed ||
      !failed
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (Number(passed) + Number(failed) !== Number(quantityInspected)) {
      alert("Passed and failed quantities must match the inspected quantity.");
      return;
    }

    addQualityLog({
      productionId,
      productName,
      batchNumber,
      quantityInspected,
      passed,
      failed,
      inspector,
      notes,
      status: Number(failed) === 0 ? "Approved" : "Pending",
    });

    setIsModalOpen(false);
    setProductionId("");
    setProductName("");
    setBatchNumber("");
    setQuantityInspected("");
    setPassed("");
    setFailed("");
    setNotes("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            Inspection Logs
          </button>
          <button
            className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            Batch Review
          </button>
        </div>
      </div>

      {activeTab === "logs" && (
        <Table
          title="Quality Control Records"
          columns={logsColumns}
          data={qualityLogs}
          filterField="status"
          filterLabel="Status"
          filterOptions={["Pending", "Approved", "Rejected"]}
          actions={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <FiPlus /> Record Inspection
            </button>
          }
        />
      )}

      {activeTab === "new" && (
        <div className="card">
          <div className="card-title">Batch Review Summary</div>
          <div className="grid-3">
            <div className="metric-card">
              <div className="metric-value">{qualityLogs.length}</div>
              <div className="metric-label">QC Records</div>
            </div>
            <div className="metric-card">
              <div className="metric-value success">
                {qualityLogs.filter((log) => log.status === "Approved").length}
              </div>
              <div className="metric-label">Approved</div>
            </div>
            <div className="metric-card">
              <div className="metric-value danger">
                {qualityLogs.filter((log) => log.failed > 0).length}
              </div>
              <div className="metric-label">With Variance</div>
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <Table
              title="Recent Batch Activity"
              columns={logsColumns}
              data={qualityLogs.slice(0, 5)}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record QC Inspection"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Save Inspection
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Production Batch</label>
            <select
              className="form-control"
              value={productionId}
              onChange={(event) => {
                const batch = productionLogs.find(
                  (item) => item.id === event.target.value,
                );
                setProductionId(event.target.value);
                setProductName(batch?.productName || "");
                setBatchNumber(
                  batch
                    ? `${batch.productName.substring(0, 3).toUpperCase()}-${batch.id.slice(-4)}`
                    : "",
                );
                setQuantityInspected(batch?.quantityPlanned || "");
                setPassed(batch?.quantityPlanned || "");
                setFailed(0);
              }}
            >
              <option value="">-- Choose batch --</option>
              {productionOptions.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input
                className="form-control"
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Inspected Qty</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={quantityInspected}
                onChange={(event) => setQuantityInspected(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Passed</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={passed}
                onChange={(event) => setPassed(event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Failed</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={failed}
                onChange={(event) => setFailed(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inspector</label>
            <input
              className="form-control"
              value={inspector}
              onChange={(event) => setInspector(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows="3"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
