import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { BarChart, DonutChart, LineChart } from "../components/Charts";

export const Reports = () => {
  const {
    rawMaterials,
    productionLogs,
    purchaseOrders,
    salesOrders,
    qualityLogs,
  } = useContext(AppContext);

  const metrics = useMemo(() => {
    const totalSales = salesOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalPurchases = purchaseOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const completedProduction = productionLogs.filter(
      (batch) => batch.status === "Completed",
    ).length;
    const approvedQc = qualityLogs.filter(
      (log) => log.status === "Approved",
    ).length;

    return { totalSales, totalPurchases, completedProduction, approvedQc };
  }, [productionLogs, purchaseOrders, qualityLogs, salesOrders]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <section className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-info">
            <span className="kpi-label">Sales Value</span>
            <span className="kpi-value">${metrics.totalSales.toFixed(2)}</span>
            <span className="kpi-trend up">
              Revenue tracked in local storage
            </span>
          </div>
          <div className="kpi-icon-wrapper">$</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-info">
            <span className="kpi-label">Purchases Value</span>
            <span className="kpi-value">
              ${metrics.totalPurchases.toFixed(2)}
            </span>
            <span className="kpi-trend up">Procurement pipeline</span>
          </div>
          <div className="kpi-icon-wrapper">P</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-info">
            <span className="kpi-label">Completed Batches</span>
            <span className="kpi-value">{metrics.completedProduction}</span>
            <span className="kpi-trend up">Finished production runs</span>
          </div>
          <div className="kpi-icon-wrapper">B</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-info">
            <span className="kpi-label">QC Approved</span>
            <span className="kpi-value">{metrics.approvedQc}</span>
            <span className="kpi-trend up">Inspection sign-offs</span>
          </div>
          <div className="kpi-icon-wrapper">Q</div>
        </div>
      </section>

      <div className="charts-grid">
        <section className="card">
          <div className="card-title">Production Trend</div>
          <LineChart
            data={productionLogs
              .slice(0, 7)
              .reverse()
              .map((batch) => ({
                label: batch.date.slice(5),
                value: batch.quantityProduced || batch.quantityPlanned,
              }))}
            height={180}
            color="var(--primary)"
          />
        </section>
        <section className="card">
          <div className="card-title">Sales Trend</div>
          <BarChart
            data={salesOrders
              .slice(0, 7)
              .reverse()
              .map((order) => ({
                label: order.soNumber.slice(-3),
                value: order.totalAmount,
              }))}
            height={180}
            color="var(--success)"
          />
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <div className="card-title">QC Outcome Mix</div>
          <DonutChart
            data={[
              {
                label: "Approved",
                value: qualityLogs.filter((item) => item.status === "Approved")
                  .length,
                color: "var(--success)",
              },
              {
                label: "Pending",
                value: qualityLogs.filter((item) => item.status === "Pending")
                  .length,
                color: "var(--warning)",
              },
              {
                label: "Rejected",
                value: qualityLogs.filter((item) => item.status === "Rejected")
                  .length,
                color: "var(--danger)",
              },
            ]}
            height={190}
            title="QC"
          />
        </section>

        <section className="card">
          <div className="card-title">Inventory Snapshot</div>
          <div className="stack-list">
            {rawMaterials.slice(0, 8).map((item) => (
              <div key={item.id} className="stack-list-item">
                <div>
                  <div className="setting-label">{item.name}</div>
                  <div className="setting-hint">
                    Reorder: {item.minStock} {item.unit}
                  </div>
                </div>
                <strong
                  className={
                    item.stock < item.minStock ? "text-danger" : "text-success"
                  }
                >
                  {item.stock} {item.unit}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
