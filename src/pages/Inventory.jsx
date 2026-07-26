import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { FiPlus, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

export const Inventory = ({ subActiveTab, setSubActiveTab, isProductModalOpen, setIsProductModalOpen }) => {
  const { 
    rawMaterials, products, wasteLogs, addWaste, addProduct, productionLogs
  } = useContext(AppContext);

  const activeTab = subActiveTab || 'materials';
  const setActiveTab = setSubActiveTab || (() => {});

  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [isProductModalOpenLocal, setIsProductModalOpenLocal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Buns');
  const [prodPrice, setProdPrice] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodStock, setProdStock] = useState('0');

  const productModalOpen = isProductModalOpen ?? isProductModalOpenLocal;
  const setProductModalOpen = setIsProductModalOpen ?? setIsProductModalOpenLocal;
  const [wasteRmId, setWasteRmId] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteReason, setWasteReason] = useState('Expired');

  // Submit Waste Form
  const handleWasteSubmit = (e) => {
    e.preventDefault();
    if (!wasteRmId || !wasteQty || Number(wasteQty) <= 0) {
      alert('Please fill all required fields correctly.');
      return;
    }
    addWaste(wasteRmId, Number(wasteQty), wasteReason);
    setIsWasteModalOpen(false);
    setWasteRmId('');
    setWasteQty('');
    setWasteReason('Expired');
  };

  // 1. Raw Materials Table Setup
  const materialColumns = [
    { header: 'Material Name', accessor: 'name', sortable: true },
    { header: 'Category', accessor: 'category', sortable: true },
    { 
      header: 'Stock Level', 
      accessor: 'stock', 
      sortable: true,
      cell: (row) => (
        <strong style={{ color: row.stock === 0 ? 'var(--danger)' : (row.stock < row.minStock ? 'var(--warning)' : 'inherit') }}>
          {row.stock} {row.unit}
        </strong>
      )
    },
    { header: 'Min Stock Limit', accessor: 'minStock' },
    { header: 'Cost per Unit', accessor: 'cost', cell: (row) => `$${row.cost.toFixed(2)}` },
    { header: 'Expiry Date', accessor: 'expiryDate', sortable: true },
    { 
      header: 'Status', 
      accessor: 'id',
      cell: (row) => {
        const isLow = row.stock < row.minStock && row.stock > 0;
        const isOut = row.stock === 0;
        const exp = new Date(row.expiryDate);
        const daysLeft = (exp - new Date()) / (1000 * 60 * 60 * 24);
        const isSoonExpiring = daysLeft >= 0 && daysLeft <= 7;

        if (isOut) return <span className="badge badge-danger">Out of Stock</span>;
        if (isSoonExpiring) return <span className="badge badge-danger" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>Expiring Soon</span>;
        if (isLow) return <span className="badge badge-warning">Low Stock</span>;
        return <span className="badge badge-success">Healthy</span>;
      }
    }
  ];

  // 2. Finished Goods Table Setup
  const productColumns = [
    { header: 'Product Name', accessor: 'name', sortable: true },
    { header: 'SKU', accessor: 'sku' },
    { header: 'Category', accessor: 'category', sortable: true },
    { header: 'Unit Price', accessor: 'price', cell: (row) => `$${row.price.toFixed(2)}` },
    { 
      header: 'In Stock', 
      accessor: 'stock', 
      sortable: true,
      cell: (row) => <strong>{row.stock} pcs</strong>
    }
  ];

  // 3. Waste Logs Table Setup
  const wasteColumns = [
    { header: 'Date Logged', accessor: 'date', sortable: true },
    { header: 'Material', accessor: 'materialName', sortable: true },
    { header: 'Quantity Discarded', accessor: 'qty', cell: (row) => `${row.qty} ${row.unit}` },
    { header: 'Reason', accessor: 'reason', sortable: true },
    { header: 'Loss Cost', accessor: 'cost', cell: (row) => `$${row.cost.toFixed(2)}` },
    { header: 'Logged By', accessor: 'loggedBy' }
  ];

  // 4. Variance Reporting Calculation
  const varianceData = React.useMemo(() => {
    const list = [];
    productionLogs.filter(p => p.status === 'Completed').forEach(run => {
      run.expectedMaterials.forEach(exp => {
        const act = run.actualMaterials.find(a => a.id === exp.id) || { qty: 0 };
        const diff = Number((act.qty - exp.qty).toFixed(2));
        list.push({
          id: `${run.id}_${exp.id}`,
          date: run.date,
          batchId: run.id,
          product: run.productName,
          material: exp.name,
          expected: `${exp.qty} ${exp.unit}`,
          actual: `${act.qty} ${exp.unit}`,
          varianceVal: diff,
          varianceText: diff === 0 ? '0' : (diff > 0 ? `+${diff} ${exp.unit}` : `${diff} ${exp.unit}`),
          percentage: exp.qty > 0 ? ((diff / exp.qty) * 100).toFixed(1) + '%' : '0%'
        });
      });
    });
    return list;
  }, [productionLogs]);

  const varianceColumns = [
    { header: 'Production Date', accessor: 'date', sortable: true },
    { header: 'Batch ID', accessor: 'batchId', cell: (row) => <strong>#{row.batchId.substring(3, 8)}</strong> },
    { header: 'Product Produced', accessor: 'product', sortable: true },
    { header: 'Ingredient', accessor: 'material', sortable: true },
    { header: 'Recipe Formula', accessor: 'expected' },
    { header: 'Actual Consumption', accessor: 'actual' },
    { 
      header: 'Difference (Variance)', 
      accessor: 'varianceVal', 
      cell: (row) => (
        <span style={{ color: row.varianceVal > 0 ? 'var(--danger)' : (row.varianceVal < 0 ? 'var(--success)' : 'inherit'), fontWeight: 600 }}>
          {row.varianceText} ({row.percentage})
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Navigation Tabs Header */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
            Raw Materials Stock
          </button>
          <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            Finished Products
          </button>
          <button className={`tab-btn ${activeTab === 'waste' ? 'active' : ''}`} onClick={() => setActiveTab('waste')}>
            Waste Spoilage Logs
          </button>
          <button className={`tab-btn ${activeTab === 'variance' ? 'active' : ''}`} onClick={() => setActiveTab('variance')}>
            Consumption Variance Report
          </button>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {rawMaterials.some(r => r.stock < r.minStock) && activeTab === 'materials' && (
        <div style={{
          backgroundColor: 'var(--danger-light)',
          borderLeft: '4px solid var(--danger)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--danger)',
          fontWeight: 500,
          fontSize: '13px'
        }}>
          <FiAlertTriangle size={18} />
          <span>Critical Warning: Several bakery ingredients have fallen below safety limits. Please review reorder levels.</span>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'materials' && (
        <Table 
          title="Raw Materials Master Stock"
          columns={materialColumns}
          data={rawMaterials}
          filterField="category"
          filterLabel="Category"
          filterOptions={['Dry Ingredients', 'Chilled', 'Liquids', 'Fillings']}
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => setIsWasteModalOpen(true)}>
              <FiTrash2 /> Register Spoilage / Waste
            </button>
          }
        />
      )}

      {activeTab === 'products' && (
        <Table 
          title="Finished Product Inventory"
          columns={productColumns}
          data={products}
          filterField="category"
          filterLabel="Category"
          filterOptions={['Buns', 'Bread', 'Cakes']}
        />
      )}

      {activeTab === 'waste' && (
        <Table 
          title="Wastage & Spoilage Register"
          columns={wasteColumns}
          data={wasteLogs}
          filterField="reason"
          filterLabel="Reason"
          filterOptions={['Expired', 'Damaged', 'Spilled', 'Dough Spoiled']}
          actions={
            <button className="btn btn-danger btn-sm" onClick={() => setIsWasteModalOpen(true)}>
              <FiPlus /> Record Waste
            </button>
          }
        />
      )}

      {activeTab === 'variance' && (
        <Table 
          title="Consumption Comparison Variance Report"
          columns={varianceColumns}
          data={varianceData}
          searchPlaceholder="Search products or ingredients..."
        />
      )}

      {/* Waste Registration Modal */}
      <Modal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        title="Record Ingredient Waste"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsWasteModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleWasteSubmit}>Save Log</button>
          </>
        }
      >
        <form onSubmit={handleWasteSubmit}>
          <div className="form-group">
            <label className="form-label">Select Raw Material <span className="required-indicator">*</span></label>
            <select 
              className="form-control"
              value={wasteRmId}
              onChange={(e) => setWasteRmId(e.target.value)}
              required
            >
              <option value="">-- Choose Material --</option>
              {rawMaterials.map(rm => (
                <option key={rm.id} value={rm.id}>
                  {rm.name} (Stock: {rm.stock} {rm.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity to Discard <span className="required-indicator">*</span></label>
            <input 
              type="number"
              className="form-control"
              placeholder="e.g. 5.5"
              step="0.01"
              min="0.01"
              value={wasteQty}
              onChange={(e) => setWasteQty(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Spoilage <span className="required-indicator">*</span></label>
            <select
              className="form-control"
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
              required
            >
              <option value="Expired">Expired Inventory</option>
              <option value="Damaged">Damaged in Handling</option>
              <option value="Spilled">Mixing / Hopper Spillage</option>
              <option value="Dough Spoiled">Dough Batch Spoiled</option>
            </select>
          </div>
        </form>
      </Modal>

    </div>
  );
};
