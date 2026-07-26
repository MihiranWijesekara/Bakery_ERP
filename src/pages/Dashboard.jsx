import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { BarChart, DonutChart, LineChart, Sparkline } from '../components/Charts';
import { 
  FiPackage, FiTrendingUp, FiActivity, FiShoppingCart, FiUsers, FiDollarSign,
  FiCheckCircle, FiAlertCircle, FiClipboard, FiClock, FiPlusCircle, FiTruck,
  FiCalendar, FiFileText, FiFilter
} from 'react-icons/fi';

export const Dashboard = ({ setActivePage, setSubActiveTab, setQuickActionOpen }) => {
  const {
    user, currentBranch, currentShift, rawMaterials, products,
    productionLogs, purchaseOrders, salesOrders, qualityLogs,
    suppliers, customers, activities
  } = useContext(AppContext);

  // Time and Date State
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const todayStr = time.toISOString().split('T')[0];
  const todayMonth = time.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDay = time.getDate();

  // Calculate statistics
  const totalRawMaterials = rawMaterials.length;
  const totalProductsCount = products.length;
  const totalSuppliers = suppliers.length;
  const totalCustomers = customers.length;

  const lowStockCount = rawMaterials.filter(rm => rm.stock < rm.minStock).length;
  const outOfStockCount = rawMaterials.filter(rm => rm.stock === 0).length;
  const soonExpiringCount = rawMaterials.filter(rm => {
    const exp = new Date(rm.expiryDate);
    const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7; // expires within 7 days
  }).length;

  const activeProductions = productionLogs.filter(p => p.status === 'Active');
  const completedProductions = productionLogs.filter(p => p.status === 'Completed');
  const pendingQC = productionLogs.filter(p => p.status === 'Active').length; // Waiting for inspection

  // Production Metrics
  const todayPlannedProd = productionLogs.filter(p => p.date === todayStr).reduce((acc, curr) => acc + curr.quantityPlanned, 0);
  const todayActualProd = productionLogs.filter(p => p.date === todayStr && p.status === 'Completed').reduce((acc, curr) => acc + curr.quantityProduced, 0);
  const todayRemainingProd = Math.max(0, todayPlannedProd - todayActualProd);

  // Purchases Metrics
  const pendingPOs = purchaseOrders.filter(p => p.status === 'Pending Approval').length;
  const orderedPOs = purchaseOrders.filter(p => p.status === 'Ordered').length;
  const receivedPOs = purchaseOrders.filter(p => p.status === 'Received').length;

  // Sales Metrics
  const totalSalesVal = salesOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const completedSalesVal = salesOrders.filter(s => s.status === 'Completed').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingDeliveries = salesOrders.filter(s => s.status === 'Processing' || s.status === 'Pending').length;

  // Quality metrics
  const totalQCInspected = qualityLogs.reduce((acc, curr) => acc + curr.quantityInspected, 0);
  const totalQCPassed = qualityLogs.reduce((acc, curr) => acc + curr.passed, 0);
  const totalQCFailed = qualityLogs.reduce((acc, curr) => acc + curr.failed, 0);
  const passedRate = totalQCInspected > 0 ? ((totalQCPassed / totalQCInspected) * 100).toFixed(1) : '100';

  // Navigate helper
  const navigateTo = (page, subTab = '') => {
    setActivePage(page);
    if (subTab && setSubActiveTab) {
      setSubActiveTab(subTab);
    }
  };

  // Mock Calendar events (Baking scheduler)
  const calendarEvents = [
    { date: 27, title: 'White Bread Production (200 Units)', type: 'production' },
    { date: 27, title: 'Raw Material Delivery (PO-002)', type: 'delivery' },
    { date: 28, title: 'Oven #3 General Maintenance', type: 'maintenance' },
    { date: 29, title: 'Shipment to City Supermarket (SO-003)', type: 'delivery' }
  ];

  // Chart data
  const productionChartData = [
    { label: 'Jul 21', value: 800 },
    { label: 'Jul 22', value: 920 },
    { label: 'Jul 23', value: 1100 },
    { label: 'Jul 24', value: 1050 },
    { label: 'Jul 25', value: 1300 },
    { label: 'Jul 26', value: 950 },
    { label: 'Jul 27', value: 750 }
  ];

  const salesChartData = [
    { label: 'Mon', value: 450 },
    { label: 'Tue', value: 580 },
    { label: 'Wed', value: 620 },
    { label: 'Thu', value: 490 },
    { label: 'Fri', value: 720 },
    { label: 'Sat', value: 900 },
    { label: 'Sun', value: 350 }
  ];

  const kpiCards = [
    {
      key: 'materials',
      variant: 'blue',
      label: 'Raw Materials',
      value: totalRawMaterials,
      badge: lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Healthy',
      badgeType: lowStockCount > 0 ? 'warning' : 'success',
      sub: `${totalRawMaterials} Active Items`,
      trend: 'up',
      spark: [8, 9, 9, 10, 10, 10, totalRawMaterials],
      color: 'var(--primary)',
      icon: <FiPackage />,
      page: 'Inventory',
    },
    {
      key: 'products',
      variant: 'green',
      label: 'Finished Products',
      value: totalProductsCount,
      badge: `${new Set(products.map(p => p.category)).size} Categories`,
      badgeType: 'success',
      sub: 'Catalog items',
      trend: 'up',
      spark: [4, 4, 5, 5, 5, 5, totalProductsCount],
      color: 'var(--success)',
      icon: <FiCheckCircle />,
      page: 'Inventory',
      subTab: 'products',
    },
    {
      key: 'production',
      variant: 'orange',
      label: 'Production Orders',
      value: productionLogs.length,
      badge: `${activeProductions.length} Active`,
      badgeType: activeProductions.length > 0 ? 'primary' : 'success',
      sub: `${completedProductions.length} Completed`,
      trend: 'up',
      spark: [1, 2, 2, 3, 2, 3, productionLogs.length],
      color: 'var(--warning)',
      icon: <FiActivity />,
      page: 'Production',
    },
    {
      key: 'purchasing',
      variant: 'red',
      label: 'Purchase Orders',
      value: purchaseOrders.length,
      badge: pendingPOs > 0 ? `${pendingPOs} Pending` : 'Clear',
      badgeType: pendingPOs > 0 ? 'danger' : 'success',
      sub: `${receivedPOs} Received`,
      trend: pendingPOs > 0 ? 'down' : 'up',
      spark: [2, 2, 3, 3, 3, 3, purchaseOrders.length],
      color: 'var(--danger)',
      icon: <FiShoppingCart />,
      page: 'Purchasing',
    },
    {
      key: 'deliveries',
      variant: 'cyan',
      label: 'Pending Deliveries',
      value: pendingDeliveries,
      badge: `${salesOrders.filter(s => s.status === 'Processing').length} Packing`,
      badgeType: 'cyan',
      sub: 'Sales shipments',
      trend: 'up',
      spark: [1, 2, 1, 3, 2, 2, pendingDeliveries],
      color: '#06b6d4',
      icon: <FiTruck />,
      page: 'Sales',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-info">
          <h1>Good morning, {user ? user.name.split(' ')[0] : 'Arthur'}!</h1>
          <p>Here is what's happening at the bakery operations today.</p>
        </div>
        <div className="welcome-meta">
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">Branch</span>
            <span className="welcome-meta-val">{currentBranch}</span>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">Current Shift</span>
            <span className="welcome-meta-val">{currentShift}</span>
          </div>
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">System Time</span>
            <span className="welcome-meta-val">{timeString}</span>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className={`kpi-card ${card.variant}`}
            onClick={() => navigateTo(card.page, card.subTab || '')}
            style={{ cursor: 'pointer' }}
          >
            <div className="kpi-info">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{card.value}</span>
              <div className="kpi-card-footer">
                <span className={`kpi-badge ${card.badgeType}`}>{card.badge}</span>
                <Sparkline data={card.spark} color={card.color} />
              </div>
              <span className={`kpi-trend ${card.trend}`}>
                {card.trend === 'up' ? <FiTrendingUp /> : <FiAlertCircle />}
                {card.sub}
              </span>
            </div>
            <div className="kpi-icon-wrapper">{card.icon}</div>
          </div>
        ))}
      </section>

      {/* Quick Actions Shortcuts Panel */}
      <section className="card" style={{ marginBottom: '4px' }}>
        <h4 className="card-title">Quick Actions Panel</h4>
        <div className="quick-actions-panel">
          <div className="quick-action-btn" onClick={() => setQuickActionOpen('production')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--primary)' }}><FiPlusCircle /></span>
            <span className="quick-action-btn-label">Create Production</span>
          </div>
          <div className="quick-action-btn" onClick={() => setQuickActionOpen('purchase')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--warning)' }}><FiPlusCircle /></span>
            <span className="quick-action-btn-label">Create Purchase</span>
          </div>
          <div className="quick-action-btn" onClick={() => setQuickActionOpen('sales')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--success)' }}><FiPlusCircle /></span>
            <span className="quick-action-btn-label">Create Sales Order</span>
          </div>
          <div className="quick-action-btn" onClick={() => navigateTo('Purchasing', 'po_list')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--primary)' }}><FiClipboard /></span>
            <span className="quick-action-btn-label">Receive Goods</span>
          </div>
          <div className="quick-action-btn" onClick={() => setQuickActionOpen('product')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--success)' }}><FiPlusCircle /></span>
            <span className="quick-action-btn-label">Add Product</span>
          </div>
          <div className="quick-action-btn" onClick={() => setQuickActionOpen('supplier')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--text-muted)' }}><FiPlusCircle /></span>
            <span className="quick-action-btn-label">Add Supplier</span>
          </div>
          <div className="quick-action-btn" onClick={() => navigateTo('Reports')}>
            <span className="quick-action-btn-icon" style={{ color: 'var(--primary)' }}><FiFileText /></span>
            <span className="quick-action-btn-label">View Reports</span>
          </div>
        </div>
      </section>

      {/* Main Row: Production Metrics & Left side widgets */}
      <div className="dashboard-row-main">
        {/* Left Column: Metrics & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Production Overview */}
          <div className="card">
            <h4 className="card-title">Production Metrics (Today)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Planned</div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{todayPlannedProd}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Completed</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>{todayActualProd}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>Remaining</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--warning)' }}>{todayRemainingProd}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>QC Defects</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>{totalQCFailed}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                <span>Production Progress</span>
                <span>{((todayActualProd / todayPlannedProd) * 100 || 0).toFixed(0)}% Done</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill success" style={{ width: `${(todayActualProd / todayPlannedProd) * 100 || 0}%` }} />
              </div>
            </div>
          </div>

          {/* Core Analytics Charts */}
          <div className="charts-grid">
            <div className="card">
              <h4 className="card-title">Monthly Production Volume</h4>
              <LineChart data={productionChartData} height={170} color="var(--primary)" />
            </div>
            <div className="card">
              <h4 className="card-title">Daily Sales Flow ($)</h4>
              <BarChart data={salesChartData} height={170} color="var(--success)" />
            </div>
            <div className="card">
              <h4 className="card-title">Ingredient Consumption Mix</h4>
              <DonutChart data={[
                { label: 'Wheat Flour', value: rawMaterials.find(r => r.id === 'rm_flour')?.stock || 350, color: 'var(--primary)' },
                { label: 'Sugar', value: rawMaterials.find(r => r.id === 'rm_sugar')?.stock || 80, color: 'var(--warning)' },
                { label: 'Eggs', value: rawMaterials.find(r => r.id === 'rm_eggs')?.stock || 120, color: 'var(--success)' },
                { label: 'Fillings', value: (rawMaterials.find(r => r.id === 'rm_fish')?.stock || 0) + (rawMaterials.find(r => r.id === 'rm_chicken')?.stock || 0), color: 'var(--danger)' },
              ]} height={170} title="Stock Mix" />
            </div>
          </div>

          {/* Active Production Queue */}
          <div className="card">
            <h4 className="card-title">Active Batches in Oven / Mixing</h4>
            <div className="table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Product</th>
                    <th>Planned Qty</th>
                    <th>Inspector</th>
                    <th>Shift</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProductions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No batches active right now.</td>
                    </tr>
                  ) : (
                    activeProductions.map(p => (
                      <tr key={p.id}>
                        <td><strong>#{p.id.substring(3, 8)}</strong></td>
                        <td>{p.productName}</td>
                        <td>{p.quantityPlanned} pcs</td>
                        <td>{p.inspector}</td>
                        <td><span className="badge badge-primary">{p.shift}</span></td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)' }}>
                            <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid rgba(2, 132, 199, 0.3)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory, Activities, Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Inventory Overview */}
          <div className="card">
            <h4 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Inventory Status</span>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                onClick={() => navigateTo('Inventory')}
              >
                Manage
              </button>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--danger)' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--danger)' }}>{lowStockCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Low Stock Items</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--warning)' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--warning)' }}>{soonExpiringCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expiring Soon</div>
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Soon Expiring List</h5>
              {rawMaterials.filter(rm => {
                const exp = new Date(rm.expiryDate);
                const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 10;
              }).slice(0, 3).map(rm => (
                <div key={rm.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--surface-border)' }}>
                  <span>{rm.name}</span>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{rm.expiryDate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Planner Widget */}
          <div className="card">
            <h4 className="card-title"><FiCalendar /> Baking & Deliveries Schedule</h4>
            <div className="calendar-widget">
              <div className="calendar-header">
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{todayMonth}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Today: {todayDay}th</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {calendarEvents.map((evt, idx) => (
                  <div key={idx} style={{ 
                    padding: '8px 12px', 
                    borderRadius: 'var(--border-radius-sm)', 
                    backgroundColor: 'var(--background)',
                    borderLeft: `4px solid ${evt.type === 'production' ? 'var(--success)' : evt.type === 'delivery' ? 'var(--warning)' : 'var(--danger)'}`,
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '2px' }}>
                      <span>{evt.type.toUpperCase()}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>July {evt.date}</span>
                    </div>
                    <div style={{ color: 'var(--text-main)' }}>{evt.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Control Overview */}
          <div className="card">
            <h4 className="card-title">Quality Assurance Review</h4>
            <DonutChart data={[
              { label: 'Passed Items', value: totalQCPassed || 348, color: 'var(--success)' },
              { label: 'Defects / Failed', value: totalQCFailed || 2, color: 'var(--danger)' }
            ]} height={130} title="QC Rate" />
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--success)', marginTop: '8px' }}>
              Overall Batch Acceptance Rate: {passedRate}%
            </div>
          </div>

          {/* Recent Operations Timeline */}
          <div className="card">
            <h4 className="card-title">Recent Audit Log</h4>
            <div className="timeline">
              {activities.slice(0, 4).map(act => (
                <div key={act.id} className="timeline-item">
                  <div className={`timeline-dot ${act.badge === 'badge-success' ? 'success' : act.badge === 'badge-danger' ? 'danger' : ''}`} />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span>{act.title}</span>
                      <span className="timeline-time">{act.time}</span>
                    </div>
                    <span className="timeline-desc">{act.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};
