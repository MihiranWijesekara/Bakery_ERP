import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { FiPlus, FiCheck, FiTruck, FiShoppingBag } from 'react-icons/fi';

export const Purchasing = ({ subActiveTab, setSubActiveTab, isWizardOpen, setIsWizardOpen }) => {
  const {
    purchaseOrders, suppliers, rawMaterials, createPurchaseOrder,
    approvePurchaseOrder, receivePurchaseOrder
  } = useContext(AppContext);

  const activeTab = subActiveTab || 'orders';
  const setActiveTab = setSubActiveTab || (() => {});

  // PO creation form state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [itemsList, setItemsList] = useState([]);
  
  // Select material to add to current PO
  const [currRmId, setCurrRmId] = useState('');
  const [currQty, setCurrQty] = useState('');

  const addMaterialToPO = () => {
    if (!currRmId || !currQty || Number(currQty) <= 0) return;
    const material = rawMaterials.find(r => r.id === currRmId);
    if (!material) return;

    // Check if item already exists
    if (itemsList.some(item => item.id === currRmId)) {
      setItemsList(prev => prev.map(item => {
        if (item.id === currRmId) {
          return { ...item, qty: Number(item.qty) + Number(currQty) };
        }
        return item;
      }));
    } else {
      setItemsList(prev => [...prev, { id: currRmId, name: material.name, qty: Number(currQty) }]);
    }

    setCurrRmId('');
    setCurrQty('');
  };

  const removeItemFromPO = (id) => {
    setItemsList(prev => prev.filter(item => item.id !== id));
  };

  const handlePOSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplierId || itemsList.length === 0) {
      alert('Please select a supplier and add at least one material.');
      return;
    }

    createPurchaseOrder(selectedSupplierId, itemsList);
    setIsWizardOpen(false);
    setSelectedSupplierId('');
    setItemsList([]);
  };

  const poColumns = [
    { header: 'PO Date', accessor: 'date', sortable: true },
    { header: 'PO Number', accessor: 'poNumber', sortable: true },
    { header: 'Supplier', accessor: 'supplierName', sortable: true },
    { 
      header: 'Items Details', 
      accessor: 'id',
      cell: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {row.items.map((item, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              • {item.name}: {item.qty} pcs (${(item.cost * item.qty).toFixed(2)})
            </span>
          ))}
        </div>
      )
    },
    { header: 'Total Value', accessor: 'totalAmount', cell: (row) => <strong>${row.totalAmount.toFixed(2)}</strong> },
    { 
      header: 'Status', 
      accessor: 'status', 
      sortable: true,
      cell: (row) => {
        if (row.status === 'Received') return <span className="badge badge-success">Received</span>;
        if (row.status === 'Ordered') return <span className="badge badge-primary">Ordered</span>;
        return <span className="badge badge-warning">Pending Approval</span>;
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => {
        if (row.status === 'Pending Approval') {
          return (
            <button className="btn btn-success btn-sm" onClick={() => approvePurchaseOrder(row.id)}>
              <FiCheck /> Approve
            </button>
          );
        }
        if (row.status === 'Ordered') {
          return (
            <button className="btn btn-primary btn-sm" onClick={() => receivePurchaseOrder(row.id)}>
              <FiTruck /> Receive Goods
            </button>
          );
        }
        return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Received ({row.deliveryDate})</span>;
      }
    }
  ];

  const supplierColumns = [
    { header: 'Supplier Name', accessor: 'name', sortable: true },
    { header: 'Contact Person', accessor: 'contact' },
    { header: 'Telephone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    { 
      header: 'Supplied Goods', 
      accessor: 'items',
      cell: (row) => (
        <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: 'var(--background)', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
          {row.items}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Purchase Orders
          </button>
          <button className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>
            Suppliers Registry
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <Table
          title="Procurement Operations Log"
          columns={poColumns}
          data={purchaseOrders}
          filterField="status"
          filterLabel="Status"
          filterOptions={['Pending Approval', 'Ordered', 'Received']}
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => setIsWizardOpen(true)}>
              <FiShoppingBag /> Raise New Purchase Order
            </button>
          }
        />
      )}

      {activeTab === 'suppliers' && (
        <Table
          title="Bakery Materials Suppliers"
          columns={supplierColumns}
          data={suppliers}
        />
      )}

      {/* PO Creation Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Raise New Purchase Order"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsWizardOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePOSubmit}>Submit PO</button>
          </>
        }
      >
        <form onSubmit={handlePOSubmit}>
          <div className="form-group">
            <label className="form-label">Select Material Supplier <span className="required-indicator">*</span></label>
            <select
              className="form-control"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              required
            >
              <option value="">-- Choose Supplier --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: 'var(--border-radius-md)', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Add Ingredients</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px' }}>Raw Material</label>
                <select
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  value={currRmId}
                  onChange={(e) => setCurrRmId(e.target.value)}
                >
                  <option value="">-- Choose --</option>
                  {rawMaterials.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name} (${rm.cost}/{rm.unit})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px' }}>Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  placeholder="e.g. 100"
                  min="1"
                  value={currQty}
                  onChange={(e) => setCurrQty(e.target.value)}
                />
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={addMaterialToPO}>Add</button>
            </div>

            {/* List of items in current PO draft */}
            {itemsList.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', textAlign: 'left', fontWeight: 'bold' }}>
                      <th style={{ padding: '4px' }}>Material</th>
                      <th style={{ padding: '4px' }}>Qty Requested</th>
                      <th style={{ padding: '4px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px dotted var(--surface-border)' }}>
                        <td style={{ padding: '6px 4px' }}>{item.name}</td>
                        <td style={{ padding: '6px 4px' }}>{item.qty} units</td>
                        <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                          <button type="button" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => removeItemFromPO(item.id)}>Remove</button>
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

    </div>
  );
};
