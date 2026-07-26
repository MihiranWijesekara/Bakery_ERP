import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { FiPlus, FiArrowRight, FiCheckCircle, FiCpu, FiFileText } from 'react-icons/fi';

export const Production = ({ subActiveTab, setSubActiveTab, isWizardOpen, setIsWizardOpen }) => {
  const {
    products, recipes, productionLogs, rawMaterials,
    createProductionEntry, completeProductionQC, currentShift
  } = useContext(AppContext);

  const activeTab = subActiveTab || 'runs';
  const setActiveTab = setSubActiveTab || (() => {});

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [plannedQty, setPlannedQty] = useState('');
  const [wizardShift, setWizardShift] = useState(currentShift);
  const [wizardInspector, setWizardInspector] = useState('John Doe (QC Supervisor)');
  const [customIngredients, setCustomIngredients] = useState({});

  // QC Completion modal state
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [activeProdId, setActiveProdId] = useState('');
  const [passedQty, setPassedQty] = useState('');
  const [failedQty, setFailedQty] = useState('');
  const [qcNotes, setQcNotes] = useState('');

  // 1. Calculate Expected Ingredients on Step 2 of wizard
  const expectedIngredients = useMemo(() => {
    if (!selectedProductId || !plannedQty) return [];
    const recipe = recipes.find(r => r.productId === selectedProductId);
    if (!recipe) return [];

    const multiplier = Number(plannedQty) / recipe.batchSize;
    return recipe.ingredients.map(ing => {
      const rm = rawMaterials.find(r => r.id === ing.id) || { stock: 0 };
      const expected = Number((ing.qty * multiplier).toFixed(2));
      return {
        id: ing.id,
        name: ing.name,
        expected,
        unit: ing.unit,
        stock: rm.stock
      };
    });
  }, [selectedProductId, plannedQty, recipes, rawMaterials]);

  // Open Step 2 of wizard
  const handleWizardNext = (e) => {
    e.preventDefault();
    if (!selectedProductId || !plannedQty || Number(plannedQty) <= 0) {
      alert('Please enter a valid product and target quantity.');
      return;
    }
    
    // Check if recipe exists
    const rec = recipes.find(r => r.productId === selectedProductId);
    if (!rec) {
      alert('No recipe (BOM) found for this product. Please define a recipe first.');
      return;
    }

    // Prepopulate custom ingredients with standard recipes values
    const initialCustoms = {};
    expectedIngredients.forEach(ing => {
      initialCustoms[ing.id] = ing.expected;
    });
    setCustomIngredients(initialCustoms);
    setWizardStep(2);
  };

  // Submit wizard (Save production order)
  const handleWizardSubmit = (e) => {
    e.preventDefault();
    
    // Check ingredient stocks
    let isStockValid = true;
    expectedIngredients.forEach(ing => {
      const inputVal = Number(customIngredients[ing.id]);
      if (inputVal > ing.stock) {
        alert(`Insufficient Stock: Only ${ing.stock} ${ing.unit} of ${ing.name} available. You need ${inputVal} ${ing.unit}.`);
        isStockValid = false;
      }
    });

    if (!isStockValid) return;

    const prId = createProductionEntry(
      selectedProductId, 
      Number(plannedQty), 
      wizardInspector, 
      wizardShift, 
      customIngredients
    );

    if (prId) {
      setIsWizardOpen(false);
      setWizardStep(1);
      setSelectedProductId('');
      setPlannedQty('');
      setCustomIngredients({});
      setActiveTab('runs');
    }
  };

  // Open QC completion Modal
  const openQcModal = (row) => {
    setActiveProdId(row.id);
    setPassedQty(row.quantityPlanned);
    setFailedQty(0);
    setQcNotes('Batch baked successfully. Crust texture conforms to specifications.');
    setQcModalOpen(true);
  };

  // Submit QC inspection
  const handleQcSubmit = (e) => {
    e.preventDefault();
    const prod = productionLogs.find(p => p.id === activeProdId);
    if (!prod) return;

    const total = Number(passedQty) + Number(failedQty);
    if (total !== prod.quantityPlanned) {
      alert(`The sum of Passed (${passedQty}) and Failed (${failedQty}) must equal the Planned quantity (${prod.quantityPlanned}).`);
      return;
    }

    completeProductionQC(activeProdId, Number(passedQty), Number(failedQty), qcNotes);
    setQcModalOpen(false);
    setActiveProdId('');
  };

  // Production Logs Table columns
  const productionColumns = [
    { header: 'Batch ID', accessor: 'id', cell: (row) => <strong>#{row.id.substring(3, 8)}</strong> },
    { header: 'Date', accessor: 'date', sortable: true },
    { header: 'Product', accessor: 'productName', sortable: true },
    { header: 'Planned Qty', accessor: 'quantityPlanned', cell: (row) => `${row.quantityPlanned} pcs` },
    { header: 'Produced Qty', accessor: 'quantityProduced', cell: (row) => row.status === 'Completed' ? `${row.quantityProduced} pcs` : '-' },
    { header: 'QC Inspector', accessor: 'inspector' },
    { header: 'Shift', accessor: 'shift', sortable: true },
    { 
      header: 'Status', 
      accessor: 'status', 
      sortable: true,
      cell: (row) => {
        if (row.status === 'Completed') return <span className="badge badge-success">Completed</span>;
        return <span className="badge badge-primary">Active Run</span>;
      }
    },
    {
      header: 'Action',
      accessor: 'id',
      cell: (row) => {
        if (row.status === 'Active') {
          return (
            <button className="btn btn-success btn-sm" onClick={() => openQcModal(row)}>
              QC Inspect & Close
            </button>
          );
        }
        return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locked</span>;
      }
    }
  ];

  // Recipe (BOM) columns
  const recipeColumns = [
    { header: 'Product Name', accessor: 'productName', sortable: true },
    { header: 'Standard Batch Size', accessor: 'batchSize', cell: (row) => `${row.batchSize} units` },
    { 
      header: 'Ingredients Formula (BOM)', 
      accessor: 'id',
      cell: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {row.ingredients.map((ing, i) => (
            <span key={i} style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              backgroundColor: 'var(--background)', 
              borderRadius: '4px',
              border: '1px solid var(--surface-border)'
            }}>
              {ing.name}: {ing.qty} {ing.unit}
            </span>
          ))}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tabs list */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button className={`tab-btn ${activeTab === 'runs' ? 'active' : ''}`} onClick={() => setActiveTab('runs')}>
            Production Operations List
          </button>
          <button className={`tab-btn ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
            Bill of Materials (BOM) Recipes
          </button>
        </div>
      </div>

      {/* Main Table view */}
      {activeTab === 'runs' && (
        <Table 
          title="Daily Production Batches"
          columns={productionColumns}
          data={productionLogs}
          filterField="status"
          filterLabel="Status"
          filterOptions={['Active', 'Completed']}
          actions={
            <button className="btn btn-primary btn-sm" onClick={() => { setWizardStep(1); setIsWizardOpen(true); }}>
              <FiPlus /> New Daily Production Entry
            </button>
          }
        />
      )}

      {activeTab === 'recipes' && (
        <Table 
          title="Product Bill of Materials Formulas"
          columns={recipeColumns}
          data={recipes}
        />
      )}

      {/* Production Entry Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={wizardStep === 1 ? "New Production Entry: Step 1" : "Confirm Ingredient Utilization: Step 2"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => {
              if (wizardStep === 2) {
                setWizardStep(1);
              } else {
                setIsWizardOpen(false);
              }
            }}>
              {wizardStep === 2 ? 'Back' : 'Cancel'}
            </button>
            <button className="btn btn-primary" onClick={wizardStep === 1 ? handleWizardNext : handleWizardSubmit}>
              {wizardStep === 1 ? 'Calculate Ingredients' : 'Authorize & Start Batch'}
            </button>
          </>
        }
      >
        {wizardStep === 1 ? (
          <form onSubmit={handleWizardNext}>
            <div className="form-group">
              <label className="form-label">Select Bakery Product <span className="required-indicator">*</span></label>
              <select
                className="form-control"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Quantity to Produce (pcs/units) <span className="required-indicator">*</span></label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 150"
                min="1"
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Working Shift <span className="required-indicator">*</span></label>
              <select
                className="form-control"
                value={wizardShift}
                onChange={(e) => setWizardShift(e.target.value)}
                required
              >
                <option value="Day Shift">Day Shift</option>
                <option value="Night Shift">Night Shift</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">QC Inspector Assigned <span className="required-indicator">*</span></label>
              <select
                className="form-control"
                value={wizardInspector}
                onChange={(e) => setWizardInspector(e.target.value)}
                required
              >
                <option value="John Doe (QC Supervisor)">John Doe (QC Supervisor)</option>
                <option value="Sarah Connor (QC Tech)">Sarah Connor (QC Tech)</option>
              </select>
            </div>
          </form>
        ) : (
          <form onSubmit={handleWizardSubmit}>
            <div style={{ marginBottom: '16px', fontSize: '13px', backgroundColor: 'var(--background)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
              <strong>Summary:</strong> Baking {plannedQty} units of <strong>{products.find(p => p.id === selectedProductId)?.name}</strong> on <strong>{wizardShift}</strong>.
            </div>
            
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Ingredient Demands (Standard vs Actual)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expectedIngredients.map(ing => {
                const actualVal = customIngredients[ing.id] || '';
                const isOverStock = Number(actualVal) > ing.stock;
                
                return (
                  <div key={ing.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{ing.name}</span> <br/>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock: {ing.stock} {ing.unit}</span>
                    </div>

                    <div style={{ fontSize: '12px' }}>
                      Recipe: <strong>{ing.expected} {ing.unit}</strong>
                    </div>

                    <div>
                      <input
                        type="number"
                        className={`form-control ${isOverStock ? 'error' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        step="0.01"
                        min="0"
                        value={actualVal}
                        onChange={(e) => setCustomIngredients({ ...customIngredients, [ing.id]: e.target.value })}
                        required
                      />
                      {isOverStock && <div style={{ color: 'var(--danger)', fontSize: '9px', fontWeight: 'bold' }}>Exceeds stock!</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        )}
      </Modal>

      {/* QC Completion Modal */}
      <Modal
        isOpen={qcModalOpen}
        onClose={() => setQcModalOpen(false)}
        title="Quality Control (QC) Inspection & Batch Completion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setQcModalOpen(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handleQcSubmit}>Authorize & Complete Batch</button>
          </>
        }
      >
        <form onSubmit={handleQcSubmit}>
          <div style={{ marginBottom: '16px', fontSize: '13px', backgroundColor: 'var(--background)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
            Inspecting Batch <strong>#{activeProdId.substring(3, 8)}</strong> ({productionLogs.find(p => p.id === activeProdId)?.productName}). Planned qty: <strong>{productionLogs.find(p => p.id === activeProdId)?.quantityPlanned} pcs</strong>.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Passed Quantity <span className="required-indicator">*</span></label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={passedQty}
                onChange={(e) => setPassedQty(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Failed / Defective Qty <span className="required-indicator">*</span></label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={failedQty}
                onChange={(e) => setFailedQty(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inspection Notes</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Describe color, size, texture anomalies..."
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>

    </div>
  );
};
