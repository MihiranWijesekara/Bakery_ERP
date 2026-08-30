import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

// Preloaded mock data
const initialRawMaterials = [
  {
    id: "rm_flour",
    name: "Wheat Flour",
    stock: 1200,
    unit: "kg",
    minStock: 250,
    cost: 1.2,
    category: "Dry Ingredients",
    expiryDate: "2026-08-15",
  },
  {
    id: "rm_sugar",
    name: "Fine Sugar",
    stock: 450,
    unit: "kg",
    minStock: 100,
    cost: 0.8,
    category: "Dry Ingredients",
    expiryDate: "2026-09-01",
  },
  {
    id: "rm_eggs",
    name: "Fresh Eggs",
    stock: 80,
    unit: "pcs",
    minStock: 150,
    cost: 0.15,
    category: "Chilled",
    expiryDate: "2026-07-31",
  }, // Low stock!
  {
    id: "rm_oil",
    name: "Vegetable Oil",
    stock: 120,
    unit: "L",
    minStock: 40,
    cost: 2.0,
    category: "Liquids",
    expiryDate: "2026-10-10",
  },
  {
    id: "rm_butter",
    name: "Unsalted Butter",
    stock: 95,
    unit: "kg",
    minStock: 30,
    cost: 5.5,
    category: "Chilled",
    expiryDate: "2026-08-10",
  },
  {
    id: "rm_yeast",
    name: "Dry Yeast",
    stock: 18,
    unit: "kg",
    minStock: 5,
    cost: 8.0,
    category: "Dry Ingredients",
    expiryDate: "2026-12-05",
  },
  {
    id: "rm_fish",
    name: "Spicy Fish Filling",
    stock: 4,
    unit: "kg",
    minStock: 10,
    cost: 12.0,
    category: "Fillings",
    expiryDate: "2026-07-29",
  }, // Low stock & soon expiring!
  {
    id: "rm_chicken",
    name: "Devilled Chicken Filling",
    stock: 26,
    unit: "kg",
    minStock: 12,
    cost: 14.5,
    category: "Fillings",
    expiryDate: "2026-07-30",
  },
  {
    id: "rm_salt",
    name: "Iodized Salt",
    stock: 50,
    unit: "kg",
    minStock: 10,
    cost: 0.5,
    category: "Dry Ingredients",
    expiryDate: "2027-02-15",
  },
  {
    id: "rm_milk",
    name: "Milk Powder",
    stock: 8,
    unit: "kg",
    minStock: 15,
    cost: 9.0,
    category: "Dry Ingredients",
    expiryDate: "2026-09-20",
  }, // Low stock!
  {
    id: "rm_onion",
    name: "Onion",
    stock: 60,
    unit: "kg",
    minStock: 15,
    cost: 1.1,
    category: "Fillings",
    expiryDate: "2026-09-10",
  },
  {
    id: "rm_tomato",
    name: "Tomato",
    stock: 45,
    unit: "kg",
    minStock: 10,
    cost: 1.4,
    category: "Fillings",
    expiryDate: "2026-09-05",
  },
];

const initialProducts = [
  {
    id: "p_fish_bun",
    name: "Baked Fish Bun",
    stock: 150,
    unit: "pcs",
    price: 1.5,
    category: "Buns",
    sku: "BUN-FSH-01",
  },
  {
    id: "p_chicken_bun",
    name: "Baked Chicken Bun",
    stock: 120,
    unit: "pcs",
    price: 1.8,
    category: "Buns",
    sku: "BUN-CHK-01",
  },
  {
    id: "p_egg_bun",
    name: "Baked Egg Bun",
    stock: 90,
    unit: "pcs",
    price: 1.4,
    category: "Buns",
    sku: "BUN-EGG-01",
  },
  {
    id: "p_white_bread",
    name: "White Bread (400g)",
    stock: 75,
    unit: "pcs",
    price: 2.2,
    category: "Bread",
    sku: "BRD-WHT-02",
  },
  {
    id: "p_choco_cake",
    name: "Chocolate Ganache Cake",
    stock: 15,
    unit: "pcs",
    price: 12.0,
    category: "Cakes",
    sku: "CAK-CHO-05",
  },
];

const initialRecipes = [
  {
    id: "r_fish_bun",
    productId: "p_fish_bun",
    productName: "Baked Fish Bun",
    batchSize: 100, // Ingredients calculated for producing 100 buns
    ingredients: [
      { id: "rm_flour", name: "Wheat Flour", qty: 10, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 1, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 10, unit: "pcs" },
      { id: "rm_oil", name: "Vegetable Oil", qty: 0.5, unit: "L" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.2, unit: "kg" },
      { id: "rm_fish", name: "Spicy Fish Filling", qty: 5, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "r_chicken_bun",
    productId: "p_chicken_bun",
    productName: "Baked Chicken Bun",
    batchSize: 100,
    ingredients: [
      { id: "rm_flour", name: "Wheat Flour", qty: 10, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 1, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 10, unit: "pcs" },
      { id: "rm_oil", name: "Vegetable Oil", qty: 0.5, unit: "L" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.2, unit: "kg" },
      {
        id: "rm_chicken",
        name: "Devilled Chicken Filling",
        qty: 5,
        unit: "kg",
      },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "r_egg_bun",
    productId: "p_egg_bun",
    productName: "Baked Egg Bun",
    batchSize: 100,
    ingredients: [
      { id: "rm_flour", name: "Wheat Flour", qty: 10, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 1.2, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 60, unit: "pcs" }, // Dough brush + boiled egg halves inside
      { id: "rm_butter", name: "Unsalted Butter", qty: 1.0, unit: "kg" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.2, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.1, unit: "kg" },
    ],
  },
  {
    id: "r_white_bread",
    productId: "p_white_bread",
    productName: "White Bread (400g)",
    batchSize: 100,
    ingredients: [
      { id: "rm_flour", name: "Wheat Flour", qty: 35, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 2.0, unit: "kg" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.7, unit: "kg" },
      { id: "rm_butter", name: "Unsalted Butter", qty: 2.0, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.5, unit: "kg" },
      { id: "rm_milk", name: "Milk Powder", qty: 1.0, unit: "kg" },
    ],
  },
];

const initialProductionLog = [
  {
    id: "pr_001",
    date: "2026-07-26",
    time: "08:30",
    productId: "p_fish_bun",
    productName: "Baked Fish Bun",
    quantityPlanned: 200,
    quantityProduced: 200,
    expectedMaterials: [
      { id: "rm_flour", name: "Wheat Flour", qty: 20, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 2, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 20, unit: "pcs" },
      { id: "rm_oil", name: "Vegetable Oil", qty: 1, unit: "L" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.4, unit: "kg" },
      { id: "rm_fish", name: "Spicy Fish Filling", qty: 10, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.2, unit: "kg" },
    ],
    actualMaterials: [
      { id: "rm_flour", name: "Wheat Flour", qty: 20.5, unit: "kg" }, // +0.5 kg variance
      { id: "rm_sugar", name: "Fine Sugar", qty: 2, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 20, unit: "pcs" },
      { id: "rm_oil", name: "Vegetable Oil", qty: 1, unit: "L" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.4, unit: "kg" },
      { id: "rm_fish", name: "Spicy Fish Filling", qty: 11, unit: "kg" }, // +1 kg variance
      { id: "rm_salt", name: "Iodized Salt", qty: 0.2, unit: "kg" },
    ],
    status: "Completed",
    inspector: "John Doe (QC Supervisor)",
    shift: "Day Shift",
    notes:
      "Flour waste was slightly higher due to hopper spill. Extra fish filling added on request.",
  },
  {
    id: "pr_002",
    date: "2026-07-26",
    time: "14:00",
    productId: "p_white_bread",
    productName: "White Bread (400g)",
    quantityPlanned: 150,
    quantityProduced: 150,
    expectedMaterials: [
      { id: "rm_flour", name: "Wheat Flour", qty: 52.5, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 3, unit: "kg" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 1.05, unit: "kg" },
      { id: "rm_butter", name: "Unsalted Butter", qty: 3, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.75, unit: "kg" },
      { id: "rm_milk", name: "Milk Powder", qty: 1.5, unit: "kg" },
    ],
    actualMaterials: [
      { id: "rm_flour", name: "Wheat Flour", qty: 52.5, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 3.1, unit: "kg" }, // +0.1 variance
      { id: "rm_yeast", name: "Dry Yeast", qty: 1.05, unit: "kg" },
      { id: "rm_butter", name: "Unsalted Butter", qty: 3, unit: "kg" },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.75, unit: "kg" },
      { id: "rm_milk", name: "Milk Powder", qty: 1.5, unit: "kg" },
    ],
    status: "Completed",
    inspector: "Sarah Connor (QC Tech)",
    shift: "Day Shift",
    notes: "Recipe strictly followed.",
  },
  {
    id: "pr_003",
    date: "2026-07-27",
    time: "01:00",
    productId: "p_chicken_bun",
    productName: "Baked Chicken Bun",
    quantityPlanned: 100,
    quantityProduced: 0,
    expectedMaterials: [
      { id: "rm_flour", name: "Wheat Flour", qty: 10, unit: "kg" },
      { id: "rm_sugar", name: "Fine Sugar", qty: 1, unit: "kg" },
      { id: "rm_eggs", name: "Fresh Eggs", qty: 10, unit: "pcs" },
      { id: "rm_oil", name: "Vegetable Oil", qty: 0.5, unit: "L" },
      { id: "rm_yeast", name: "Dry Yeast", qty: 0.2, unit: "kg" },
      {
        id: "rm_chicken",
        name: "Devilled Chicken Filling",
        qty: 5,
        unit: "kg",
      },
      { id: "rm_salt", name: "Iodized Salt", qty: 0.1, unit: "kg" },
    ],
    actualMaterials: [],
    status: "Active",
    inspector: "Sarah Connor (QC Tech)",
    shift: "Night Shift",
    notes: "Mixing dough stage.",
  },
];

const initialWasteLog = [
  {
    id: "w_001",
    date: "2026-07-25",
    materialId: "rm_eggs",
    materialName: "Fresh Eggs",
    qty: 12,
    unit: "pcs",
    reason: "Damaged (Cracked during delivery)",
    cost: 1.8,
    loggedBy: "Bob Marley",
  },
  {
    id: "w_002",
    date: "2026-07-26",
    materialId: "rm_milk",
    materialName: "Milk Powder",
    qty: 2.5,
    unit: "kg",
    reason: "Spoiled (Dampness/Clumping)",
    cost: 22.5,
    loggedBy: "John Doe",
  },
];

const initialPurchaseOrders = [
  {
    id: "po_001",
    poNumber: "PO-2026-001",
    date: "2026-07-24",
    supplierId: "s_alpha",
    supplierName: "Alpha Milling Co",
    items: [
      { id: "rm_flour", name: "Wheat Flour", qty: 500, cost: 1.1 },
      { id: "rm_salt", name: "Iodized Salt", qty: 50, cost: 0.45 },
    ],
    totalAmount: 572.5,
    status: "Received",
    deliveryDate: "2026-07-25",
  },
  {
    id: "po_002",
    poNumber: "PO-2026-002",
    date: "2026-07-26",
    supplierId: "s_poultry",
    supplierName: "Sunnyside Poultry Farms",
    items: [{ id: "rm_eggs", name: "Fresh Eggs", qty: 300, cost: 0.13 }],
    totalAmount: 39.0,
    status: "Ordered",
    deliveryDate: "2026-07-28",
  },
  {
    id: "po_003",
    poNumber: "PO-2026-003",
    date: "2026-07-27",
    supplierId: "s_gold",
    supplierName: "Golden Dairy Ltd",
    items: [
      { id: "rm_butter", name: "Unsalted Butter", qty: 100, cost: 5.2 },
      { id: "rm_milk", name: "Milk Powder", qty: 40, cost: 8.5 },
    ],
    totalAmount: 860.0,
    status: "Pending Approval",
    deliveryDate: "2026-07-30",
  },
];

const initialSalesOrders = [
  {
    id: "so_001",
    soNumber: "SO-2026-001",
    date: "2026-07-25",
    customerId: "c_city",
    customerName: "City Supermarket",
    items: [
      { id: "p_fish_bun", name: "Baked Fish Bun", qty: 100, price: 1.5 },
      { id: "p_chicken_bun", name: "Baked Chicken Bun", qty: 80, price: 1.8 },
    ],
    totalAmount: 294.0,
    status: "Completed",
    deliveryDate: "2026-07-26",
  },
  {
    id: "so_002",
    soNumber: "SO-2026-002",
    date: "2026-07-26",
    customerId: "c_coffee",
    customerName: "Corner Coffee Shop",
    items: [
      { id: "p_white_bread", name: "White Bread (400g)", qty: 40, price: 2.2 },
      {
        id: "p_choco_cake",
        name: "Chocolate Ganache Cake",
        qty: 5,
        price: 12.0,
      },
    ],
    totalAmount: 148.0,
    status: "Processing",
    deliveryDate: "2026-07-27",
  },
  {
    id: "so_003",
    soNumber: "SO-2026-003",
    date: "2026-07-27",
    customerId: "c_elite",
    customerName: "Elite Catering Services",
    items: [
      { id: "p_fish_bun", name: "Baked Fish Bun", qty: 200, price: 1.4 }, // Bulk discount
      { id: "p_egg_bun", name: "Baked Egg Bun", qty: 150, price: 1.4 },
    ],
    totalAmount: 490.0,
    status: "Pending",
    deliveryDate: "2026-07-28",
  },
];

const initialQualityLogs = [
  {
    id: "qc_001",
    productionId: "pr_001",
    productName: "Baked Fish Bun",
    date: "2026-07-26",
    batchNumber: "B-FSH-0726A",
    quantityInspected: 200,
    passed: 198,
    failed: 2,
    status: "Approved",
    inspector: "John Doe (QC Supervisor)",
    notes: "2 buns rejected due to filling leakage in baking.",
  },
  {
    id: "qc_002",
    productionId: "pr_002",
    productName: "White Bread (400g)",
    date: "2026-07-26",
    batchNumber: "B-WHT-0726B",
    quantityInspected: 150,
    passed: 150,
    failed: 0,
    status: "Approved",
    inspector: "Sarah Connor (QC Tech)",
    notes: "Excellent crust texture and moisture.",
  },
];

const initialSuppliers = [
  {
    id: "s_alpha",
    name: "Alpha Milling Co",
    contact: "sales@alphamilling.com",
    phone: "+1 555-0190",
    address: "100 Mill Road, Kansas",
    items: "Flour, Salt",
  },
  {
    id: "s_sweet",
    name: "SweetFields Sugar Corp",
    contact: "info@sweetfields.com",
    phone: "+1 555-0191",
    address: "42 Sweet Lane, Nebraska",
    items: "Sugar",
  },
  {
    id: "s_poultry",
    name: "Sunnyside Poultry Farms",
    contact: "orders@sunnysidepoultry.com",
    phone: "+1 555-0192",
    address: "77 Farm Road, Georgia",
    items: "Eggs",
  },
  {
    id: "s_gold",
    name: "Golden Dairy Ltd",
    contact: "wholesale@goldendairy.com",
    phone: "+1 555-0193",
    address: "30 Pasteur Street, Wisconsin",
    items: "Butter, Milk Powder",
  },
  {
    id: "s_ocean",
    name: "OceanFresh Fillings Inc",
    contact: "b2b@oceanfreshfillings.com",
    phone: "+1 555-0194",
    address: "99 Seafood Pier, Maine",
    items: "Fish Filling",
  },
  {
    id: "s_poultry_prime",
    name: "PoultryPrime Supplies",
    contact: "info@poultryprime.com",
    phone: "+1 555-0195",
    address: "12 Chicken Run, Texas",
    items: "Chicken Filling",
  },
];

const initialCustomers = [
  {
    id: "c_city",
    name: "City Supermarket",
    contact: "procurement@citysuper.com",
    phone: "+1 555-0210",
    address: "500 Retail Plaza, New York",
  },
  {
    id: "c_coffee",
    name: "Corner Coffee Shop",
    contact: "jack@cornercoffee.com",
    phone: "+1 555-0211",
    address: "12 Baker Street, Chicago",
  },
  {
    id: "c_elite",
    name: "Elite Catering Services",
    contact: "events@elitecatering.com",
    phone: "+1 555-0212",
    address: "88 Banquet Hall, Texas",
  },
  {
    id: "c_school",
    name: "HighSchool Cafeteria",
    contact: "kitchen@hscafeteria.edu",
    phone: "+1 555-0213",
    address: "101 Education Way, Ohio",
  },
];

const initialActivities = [
  {
    id: "act_1",
    type: "production",
    title: "Production Started",
    desc: "Batch #pr_003 for 100 Chicken Buns entered Active state.",
    time: "01:00 AM",
    date: "2026-07-27",
    badge: "badge-primary",
  },
  {
    id: "act_2",
    type: "sales",
    title: "New Sales Order Created",
    desc: "Order #SO-2026-003 created for Elite Catering Services ($490.00).",
    time: "11:45 PM",
    date: "2026-07-26",
    badge: "badge-success",
  },
  {
    id: "act_3",
    type: "production",
    title: "Production Completed",
    desc: "150 loaves of White Bread (400g) produced. QC Approved.",
    time: "04:15 PM",
    date: "2026-07-26",
    badge: "badge-success",
  },
  {
    id: "act_4",
    type: "purchase",
    title: "Goods Received",
    desc: "Purchase Order #PO-2026-001 (500kg Wheat Flour) received from Alpha Milling Co.",
    time: "09:00 AM",
    date: "2026-07-25",
    badge: "badge-primary",
  },
  {
    id: "act_5",
    type: "waste",
    title: "Waste Registered",
    desc: "12 Fresh Eggs discarded due to damage.",
    time: "03:30 PM",
    date: "2026-07-25",
    badge: "badge-danger",
  },
];

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(
    () => localStorage.getItem("erp_theme") || "light",
  );

  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("erp_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentBranch, setCurrentBranch] = useState(
    () => localStorage.getItem("erp_branch") || "Main Bakery - Colombo",
  );
  const [currentShift, setCurrentShift] = useState(
    () => localStorage.getItem("erp_shift") || "Day Shift",
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("erp_notifications_enabled") !== "false",
  );

  // ERP Databases
  const [rawMaterials, setRawMaterials] = useState(() => {
    const data = localStorage.getItem("erp_rm");
    return data ? JSON.parse(data) : initialRawMaterials;
  });

  const [products, setProducts] = useState(() => {
    const data = localStorage.getItem("erp_products");
    return data ? JSON.parse(data) : initialProducts;
  });

  const [recipes, setRecipes] = useState(() => {
    const data = localStorage.getItem("erp_recipes");
    return data ? JSON.parse(data) : initialRecipes;
  });

  const [productionLogs, setProductionLogs] = useState(() => {
    const data = localStorage.getItem("erp_production");
    return data ? JSON.parse(data) : initialProductionLog;
  });

  const [wasteLogs, setWasteLogs] = useState(() => {
    const data = localStorage.getItem("erp_waste");
    return data ? JSON.parse(data) : initialWasteLog;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const data = localStorage.getItem("erp_po");
    return data ? JSON.parse(data) : initialPurchaseOrders;
  });

  const [salesOrders, setSalesOrders] = useState(() => {
    const data = localStorage.getItem("erp_so");
    return data ? JSON.parse(data) : initialSalesOrders;
  });

  const [qualityLogs, setQualityLogs] = useState(() => {
    const data = localStorage.getItem("erp_qc");
    return data ? JSON.parse(data) : initialQualityLogs;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const data = localStorage.getItem("erp_suppliers");
    return data ? JSON.parse(data) : initialSuppliers;
  });

  const [customers, setCustomers] = useState(() => {
    const data = localStorage.getItem("erp_customers");
    return data ? JSON.parse(data) : initialCustomers;
  });

  const [activities, setActivities] = useState(() => {
    const data = localStorage.getItem("erp_activities");
    return data ? JSON.parse(data) : initialActivities;
  });

  const [notifications, setNotifications] = useState([
    {
      id: "not_1",
      title: "Low Stock Alert",
      desc: "Fresh Eggs are below reorder level (80 pcs left).",
      type: "danger",
      unread: true,
    },
    {
      id: "not_2",
      title: "Expiring Ingredients",
      desc: "Spicy Fish Filling expires in 2 days.",
      type: "warning",
      unread: true,
    },
    {
      id: "not_3",
      title: "Pending Approval",
      desc: "Purchase Order #PO-2026-003 requires manager clearance.",
      type: "primary",
      unread: false,
    },
  ]);

  const [toasts, setToasts] = useState([]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("erp_theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("erp_rm", JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    localStorage.setItem("erp_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("erp_recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem("erp_production", JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem("erp_waste", JSON.stringify(wasteLogs));
  }, [wasteLogs]);

  useEffect(() => {
    localStorage.setItem("erp_po", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("erp_so", JSON.stringify(salesOrders));
  }, [salesOrders]);

  useEffect(() => {
    localStorage.setItem("erp_qc", JSON.stringify(qualityLogs));
  }, [qualityLogs]);

  useEffect(() => {
    localStorage.setItem("erp_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("erp_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("erp_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("erp_branch", currentBranch);
  }, [currentBranch]);

  useEffect(() => {
    localStorage.setItem("erp_shift", currentShift);
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem(
      "erp_notifications_enabled",
      notificationsEnabled ? "true" : "false",
    );
  }, [notificationsEnabled]);

  // Toast Action helper
  const showToast = (title, message, type = "info") => {
    if (!notificationsEnabled && (type === "danger" || type === "warning")) {
      return;
    }
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity logger
  const logActivity = (type, title, desc, badge) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateStr = now.toISOString().split("T")[0];
    const newAct = {
      id: `act_${Date.now()}`,
      type,
      title,
      desc,
      time: timeStr,
      date: dateStr,
      badge: badge || "badge-primary",
    };
    setActivities((prev) => [newAct, ...prev].slice(0, 50));
  };

  // Auth Operations
  const login = (email, password, rememberMe = true) => {
    const storedPassword = localStorage.getItem("erp_password") || "admin123";
    if (email === "admin@bakery.com" && password === storedPassword) {
      const savedProfile = localStorage.getItem("erp_user_profile");
      const profile = savedProfile
        ? JSON.parse(savedProfile)
        : {
            name: "Arthur Pendragon",
            email,
            role: "Operations Manager",
            avatar: "AP",
          };
      const loggedUser = { ...profile, email };
      setUser(loggedUser);
      localStorage.setItem("erp_user", JSON.stringify(loggedUser));
      if (rememberMe) {
        localStorage.setItem("erp_remember_email", email);
      } else {
        localStorage.removeItem("erp_remember_email");
      }
      showToast(
        "Login Successful",
        `Welcome back, ${loggedUser.name.split(" ")[0]}!`,
        "success",
      );
      return true;
    }
    return false;
  };

  const updateProfile = (name, email) => {
    if (!user) return false;
    const updated = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      avatar: (name.trim() || user.name)
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
    setUser(updated);
    localStorage.setItem("erp_user", JSON.stringify(updated));
    localStorage.setItem("erp_user_profile", JSON.stringify(updated));
    showToast("Profile Updated", "Your profile details were saved.", "success");
    return true;
  };

  const updatePassword = (currentPassword, newPassword) => {
    const storedPassword = localStorage.getItem("erp_password") || "admin123";
    if (currentPassword !== storedPassword) {
      showToast("Password Error", "Current password is incorrect.", "danger");
      return false;
    }
    localStorage.setItem("erp_password", newPassword);
    showToast("Password Updated", "Your password has been changed.", "success");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("erp_user");
    showToast("Logged Out", "You have been successfully logged out.", "info");
  };

  // Inventory & Quality Actions
  const addWaste = (
    materialId,
    qty,
    reason,
    { unitCostPrice, totalPrice, expiryDate, creationDate } = {},
  ) => {
    const material = rawMaterials.find((rm) => rm.id === materialId);
    if (!material) return;
    if (material.stock < qty) {
      showToast("Error", `Insufficient stock for ${material.name}.`, "danger");
      return;
    }

    const cost = Number((totalPrice ?? material.cost * qty).toFixed(2));
    const newWaste = {
      id: `w_${Date.now()}`,
      date: creationDate || new Date().toISOString().split("T")[0],
      materialId,
      materialName: material.name,
      qty,
      unit: material.unit,
      reason,
      unitCostPrice: unitCostPrice ?? material.cost,
      totalPrice: cost,
      expiryDate: expiryDate || null,
      cost,
      loggedBy: user ? user.name : "System",
    };

    setWasteLogs((prev) => [newWaste, ...prev]);
    setRawMaterials((prev) =>
      prev.map((rm) => {
        if (rm.id === materialId) {
          const nextStock = rm.stock - qty;
          if (nextStock < rm.minStock) {
            triggerLowStockAlert(rm.name, nextStock, rm.unit);
          }
          return { ...rm, stock: nextStock };
        }
        return rm;
      }),
    );

    logActivity(
      "waste",
      "Waste Registered",
      `${qty}${material.unit} of ${material.name} logged as waste: ${reason}`,
      "badge-danger",
    );
    showToast(
      "Waste Logged",
      `${qty}${material.unit} of ${material.name} marked as waste.`,
      "success",
    );
  };

  // Low stock alert generator
  const triggerLowStockAlert = (name, stockVal, unit) => {
    const alertId = `not_${Date.now()}`;
    const newAlert = {
      id: alertId,
      title: "Low Stock Warning",
      desc: `${name} has fallen below safety levels (${stockVal} ${unit} left).`,
      type: "danger",
      unread: true,
    };
    setNotifications((prev) => [newAlert, ...prev]);
    showToast("Low Stock Alert", `${name} is running low!`, "danger");
  };

  // Daily Production Execution
  const createProductionEntry = (
    productId,
    qtyPlanned,
    inspectorName,
    selectedShift,
    customIngredients = null,
  ) => {
    const recipe = recipes.find((r) => r.productId === productId);
    const product = products.find((p) => p.id === productId);
    if (!recipe || !product) return null;

    // 1. Calculate expected ingredients
    const multiplier = qtyPlanned / recipe.batchSize;
    const expectedMaterials = recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      qty: Number((ing.qty * multiplier).toFixed(2)),
      unit: ing.unit,
    }));

    // 2. Prepare actual ingredients based on user inputs or defaults
    const actualMaterials = expectedMaterials.map((exp) => {
      const customQty = customIngredients && customIngredients[exp.id];
      const actualQty = customQty !== undefined ? Number(customQty) : exp.qty;
      return {
        id: exp.id,
        name: exp.name,
        qty: actualQty,
        unit: exp.unit,
      };
    });

    // 3. Verify physical inventory is available
    for (const actual of actualMaterials) {
      const currentRm = rawMaterials.find((rm) => rm.id === actual.id);
      if (!currentRm || currentRm.stock < actual.qty) {
        showToast(
          "Insufficient Ingredients",
          `Not enough ${actual.name} in stock. Available: ${currentRm ? currentRm.stock : 0} ${actual.unit}. Needed: ${actual.qty} ${actual.unit}.`,
          "danger",
        );
        return false;
      }
    }

    // 4. Subtract actual ingredients from raw materials inventory
    setRawMaterials((prev) =>
      prev.map((rm) => {
        const materialUsed = actualMaterials.find((a) => a.id === rm.id);
        if (materialUsed) {
          const nextStock = Number((rm.stock - materialUsed.qty).toFixed(2));
          if (nextStock < rm.minStock) {
            setTimeout(
              () => triggerLowStockAlert(rm.name, nextStock, rm.unit),
              100,
            );
          }
          return { ...rm, stock: nextStock };
        }
        return rm;
      }),
    );

    // 5. Generate Production Order
    const prId = `pr_${Date.now()}`;
    const newProduction = {
      id: prId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      productId,
      productName: product.name,
      quantityPlanned: Number(qtyPlanned),
      quantityProduced: 0, // 0 initially, updated during QC completion
      expectedMaterials,
      actualMaterials,
      status: "Active",
      inspector: inspectorName,
      shift: selectedShift || currentShift,
      notes: "Production started. Awaiting quality control check.",
    };

    setProductionLogs((prev) => [newProduction, ...prev]);
    logActivity(
      "production",
      "Production Started",
      `Batch #${prId} for ${qtyPlanned} ${product.name} initialized.`,
      "badge-primary",
    );
    showToast(
      "Production Started",
      `Batch for ${qtyPlanned} units is now active.`,
      "success",
    );
    return prId;
  };

  // Complete Production order with QC inspection details
  const completeProductionQC = (
    productionId,
    passedQty,
    failedQty,
    notesText,
  ) => {
    const prod = productionLogs.find((p) => p.id === productionId);
    if (!prod) return;

    const totalInspected = Number(passedQty) + Number(failedQty);
    if (totalInspected !== prod.quantityPlanned) {
      showToast(
        "Validation Error",
        `Total inspected quantity (${totalInspected}) must match planned quantity (${prod.quantityPlanned}).`,
        "warning",
      );
      return;
    }

    // Update production status and actual products produced
    setProductionLogs((prev) =>
      prev.map((p) => {
        if (p.id === productionId) {
          return {
            ...p,
            quantityProduced: Number(passedQty),
            status: "Completed",
            notes: notesText,
          };
        }
        return p;
      }),
    );

    // Add finished goods to products inventory
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === prod.productId) {
          return { ...p, stock: p.stock + Number(passedQty) };
        }
        return p;
      }),
    );

    // Create QC Log
    const newQc = {
      id: `qc_${Date.now()}`,
      productionId,
      productName: prod.productName,
      date: new Date().toISOString().split("T")[0],
      batchNumber: `B-${prod.productName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      quantityInspected: totalInspected,
      passed: Number(passedQty),
      failed: Number(failedQty),
      status:
        Number(failedQty) === 0
          ? "Approved"
          : Number(passedQty) > 0
            ? "Partially Approved"
            : "Rejected",
      inspector: prod.inspector,
      notes: notesText,
    };
    setQualityLogs((prev) => [newQc, ...prev]);

    // If failed qty exists, trigger alert/timeline event
    if (Number(failedQty) > 0) {
      const qcAlert = {
        id: `not_qc_${Date.now()}`,
        title: "QC Inspection Defect",
        desc: `${failedQty} units of ${prod.productName} failed QC checks.`,
        type: "danger",
        unread: true,
      };
      setNotifications((prev) => [qcAlert, ...prev]);
    }

    logActivity(
      "production",
      "Production Completed",
      `Batch #${productionId} finished. Passed: ${passedQty}, Failed: ${failedQty}. Finished goods added to stock.`,
      "badge-success",
    );
    showToast(
      "Batch Completed",
      `QC inspection logged. Finished stock updated.`,
      "success",
    );
  };

  const addQualityLog = ({
    productionId = "",
    productName,
    batchNumber,
    quantityInspected,
    passed,
    failed,
    inspector,
    notes,
    status = "Pending",
  }) => {
    const totalInspected = Number(quantityInspected);
    const passedQty = Number(passed);
    const failedQty = Number(failed);
    const newQc = {
      id: `qc_${Date.now()}`,
      productionId,
      productName,
      date: new Date().toISOString().split("T")[0],
      batchNumber,
      quantityInspected: totalInspected,
      passed: passedQty,
      failed: failedQty,
      status,
      inspector,
      notes,
    };

    setQualityLogs((prev) => [newQc, ...prev]);
    logActivity(
      "quality",
      "QC Log Added",
      `Inspection recorded for ${productName} (${batchNumber}).`,
      "badge-primary",
    );
    showToast("QC Log Saved", `${productName} inspection recorded.`, "success");
    return newQc.id;
  };

  const updateQualityLogStatus = (qualityLogId, status, notesText = "") => {
    setQualityLogs((prev) =>
      prev.map((log) => {
        if (log.id !== qualityLogId) {
          return log;
        }

        return {
          ...log,
          status,
          notes: notesText || log.notes,
        };
      }),
    );

    const targetLog = qualityLogs.find((log) => log.id === qualityLogId);
    if (targetLog) {
      logActivity(
        "quality",
        `QC ${status}`,
        `Batch ${targetLog.batchNumber} updated to ${status}.`,
        status === "Rejected" ? "badge-danger" : "badge-success",
      );
    }
    showToast(
      "QC Updated",
      `Batch marked as ${status.toLowerCase()}.`,
      status === "Rejected" ? "warning" : "success",
    );
  };

  // Receive Purchase Order
  const receivePurchaseOrder = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === "Received") return;

    // Update PO status
    setPurchaseOrders((prev) =>
      prev.map((p) => {
        if (p.id === poId) {
          return {
            ...p,
            status: "Received",
            deliveryDate: new Date().toISOString().split("T")[0],
          };
        }
        return p;
      }),
    );

    // Add items to raw materials inventory
    setRawMaterials((prev) =>
      prev.map((rm) => {
        const itemReceived = po.items.find((item) => item.id === rm.id);
        if (itemReceived) {
          return {
            ...rm,
            stock: rm.stock + itemReceived.qty,
            cost: itemReceived.cost, // Update current standard cost
          };
        }
        return rm;
      }),
    );

    logActivity(
      "purchase",
      "Goods Received",
      `Purchase Order #${po.poNumber} received. Stock levels increased.`,
      "badge-success",
    );
    showToast(
      "Goods Received",
      `Raw materials from PO #${po.poNumber} added to stock.`,
      "success",
    );
  };

  // Approve Purchase Order
  const approvePurchaseOrder = (poId) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => {
        if (p.id === poId && p.status === "Pending Approval") {
          return { ...p, status: "Ordered" };
        }
        return p;
      }),
    );
    showToast(
      "PO Approved",
      "Purchase Order approved and sent to supplier.",
      "success",
    );
  };

  // Create direct purchase entry and add items to stock immediately
  const createPurchaseOrder = (
    supplierId,
    itemsList,
    purchaseDate = new Date().toISOString().split("T")[0],
  ) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier || !Array.isArray(itemsList) || itemsList.length === 0) {
      showToast(
        "Purchase Incomplete",
        "Please select a supplier and add at least one material.",
        "danger",
      );
      return null;
    }

    const formattedItems = itemsList
      .map((item) => {
        const rm = rawMaterials.find((r) => r.id === item.id);
        if (!rm) return null;

        const qty = Number(item.qty);
        const unitPrice = Number(item.unitPrice ?? rm.cost ?? 0);

        if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice)) {
          return null;
        }

        return {
          id: item.id,
          name: rm.name,
          qty,
          unit: rm.unit,
          unitPrice,
          total: Number((qty * unitPrice).toFixed(2)),
        };
      })
      .filter(Boolean);

    if (formattedItems.length === 0) {
      showToast(
        "Purchase Incomplete",
        "Please add valid raw material quantities and prices.",
        "danger",
      );
      return null;
    }

    const totalAmount = formattedItems.reduce(
      (acc, curr) => acc + Number(curr.total),
      0,
    );
    const poNum = `PUR-${Date.now().toString().slice(-6)}`;

    setRawMaterials((prev) =>
      prev.map((rm) => {
        const purchasedItem = formattedItems.find((item) => item.id === rm.id);
        if (!purchasedItem) return rm;

        return {
          ...rm,
          stock: Number(rm.stock) + Number(purchasedItem.qty),
          cost: Number(purchasedItem.unitPrice) || Number(rm.cost) || 0,
        };
      }),
    );

    const newPO = {
      id: `po_${Date.now()}`,
      poNumber: poNum,
      date: purchaseDate,
      supplierId,
      supplierName: supplier.name,
      items: formattedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: "Completed",
      deliveryDate: purchaseDate,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    logActivity(
      "purchase",
      "Purchase Added to Stock",
      `${poNum} completed for ${supplier.name}. Raw material stock updated.`,
      "badge-success",
    );
    showToast(
      "Purchase Completed",
      `Purchase ${poNum} saved. Stock updated for ${formattedItems.length} material(s).`,
      "success",
    );

    return newPO;
  };

  const updatePurchaseOrder = (
    purchaseId,
    supplierId,
    itemsList,
    purchaseDate,
  ) => {
    const existingPurchase = purchaseOrders.find((po) => po.id === purchaseId);
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (
      !existingPurchase ||
      !supplier ||
      !Array.isArray(itemsList) ||
      !itemsList.length
    ) {
      return null;
    }

    const formattedItems = itemsList.map((item) => ({
      id: item.id,
      name: item.name,
      qty: Number(item.qty),
      unit: item.unit,
      unitPrice: Number(item.unitPrice ?? item.cost ?? 0),
      total: Number(
        (Number(item.qty) * Number(item.unitPrice ?? item.cost ?? 0)).toFixed(
          2,
        ),
      ),
    }));
    const totalAmount = formattedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    setRawMaterials((prev) =>
      prev.map((rm) => {
        const oldItem = existingPurchase.items.find(
          (item) => item.id === rm.id,
        );
        const newItem = formattedItems.find((item) => item.id === rm.id);
        return {
          ...rm,
          stock:
            Number(rm.stock) -
            Number(oldItem?.qty || 0) +
            Number(newItem?.qty || 0),
          ...(newItem ? { cost: newItem.unitPrice } : {}),
        };
      }),
    );

    const updatedPurchase = {
      ...existingPurchase,
      supplierId,
      supplierName: supplier.name,
      date: purchaseDate,
      deliveryDate: purchaseDate,
      items: formattedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
    };
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === purchaseId ? updatedPurchase : po)),
    );
    showToast(
      "Purchase Updated",
      `${existingPurchase.poNumber} was updated.`,
      "success",
    );
    return updatedPurchase;
  };

  const deletePurchaseOrder = (purchaseId) => {
    const purchase = purchaseOrders.find((po) => po.id === purchaseId);
    if (!purchase) return false;

    setRawMaterials((prev) =>
      prev.map((rm) => {
        const item = purchase.items.find(
          (purchaseItem) => purchaseItem.id === rm.id,
        );
        return item
          ? { ...rm, stock: Number(rm.stock) - Number(item.qty) }
          : rm;
      }),
    );
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== purchaseId));
    showToast(
      "Purchase Deleted",
      `${purchase.poNumber} was deleted and stock was reversed.`,
      "success",
    );
    return true;
  };

  // Ship/Deliver Sales Order
  const deliverSalesOrder = (soId) => {
    const so = salesOrders.find((s) => s.id === soId);
    if (!so || so.status === "Completed") return;

    // Check if enough product stock is available
    for (const item of so.items) {
      const prod = products.find((p) => p.id === item.id);
      if (!prod || prod.stock < item.qty) {
        showToast(
          "Stock Shortage",
          `Not enough ${prod ? prod.name : "product"} stock to fulfill order. Available: ${prod ? prod.stock : 0}. Required: ${item.qty}.`,
          "danger",
        );
        return;
      }
    }

    // Subtract from finished goods stock
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = so.items.find((item) => item.id === p.id);
        if (ordered) {
          return { ...p, stock: p.stock - ordered.qty };
        }
        return p;
      }),
    );

    // Update sales order status
    setSalesOrders((prev) =>
      prev.map((s) => {
        if (s.id === soId) {
          return {
            ...s,
            status: "Completed",
            deliveryDate: new Date().toISOString().split("T")[0],
          };
        }
        return s;
      }),
    );

    logActivity(
      "sales",
      "Sales Order Delivered",
      `Order #${so.soNumber} successfully delivered to ${so.customerName}.`,
      "badge-success",
    );
    showToast(
      "Order Shipped",
      `Sales Order #${so.soNumber} marked as completed.`,
      "success",
    );
  };

  // Create Sales Order
  const createSalesOrder = (customerId, itemsList) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer || itemsList.length === 0) return;

    const formattedItems = itemsList.map((item) => {
      const prod = products.find((p) => p.id === item.id);
      return {
        id: item.id,
        name: prod ? prod.name : "Unknown",
        qty: Number(item.qty),
        price: prod ? prod.price : 2.0,
      };
    });

    const totalAmount = formattedItems.reduce(
      (acc, curr) => acc + curr.qty * curr.price,
      0,
    );
    const soNum = `SO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newSO = {
      id: `so_${Date.now()}`,
      soNumber: soNum,
      date: new Date().toISOString().split("T")[0],
      customerId,
      customerName: customer.name,
      items: formattedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: "Pending",
      deliveryDate: "",
    };

    setSalesOrders((prev) => [newSO, ...prev]);
    logActivity(
      "sales",
      "Sales Order Created",
      `Order ${soNum} ($${totalAmount.toFixed(2)}) registered for ${customer.name}.`,
      "badge-primary",
    );
    showToast(
      "Sales Order Created",
      `Order ${soNum} created successfully.`,
      "success",
    );
  };

  // Add new Product / Supplier
  const addProduct = (name, category, price, sku, initialStock) => {
    const id = `p_${Date.now()}`;
    const newProd = {
      id,
      name,
      category,
      price: Number(price),
      sku,
      stock: Number(initialStock),
      unit: "pcs",
    };
    setProducts((prev) => [...prev, newProd]);
    showToast("Product Added", `${name} created in catalog.`, "success");
  };

  const addSupplier = (name, contact, phone, address, items) => {
    const id = `s_${Date.now()}`;
    const newSup = { id, name, contact, phone, address, items };
    setSuppliers((prev) => [...prev, newSup]);
    logActivity(
      "purchase",
      "Supplier Added",
      `${name} registered in supplier master.`,
      "badge-primary",
    );
    showToast("Supplier Added", `${name} registered.`, "success");
    return id;
  };

  const addCustomer = (name, contact, phone, address) => {
    const id = `c_${Date.now()}`;
    const newCustomer = { id, name, contact, phone, address };
    setCustomers((prev) => [...prev, newCustomer]);
    logActivity(
      "sales",
      "Customer Added",
      `${name} registered in customer master.`,
      "badge-primary",
    );
    showToast("Customer Added", `${name} registered.`, "success");
    return id;
  };

  // Recipes / BOM updates
  const addRecipe = (productId, batchSize, ingredientsList) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newRecipe = {
      id: `r_${Date.now()}`,
      productId,
      productName: prod.name,
      batchSize: Number(batchSize),
      ingredients: ingredientsList.map((ing) => {
        const rm = rawMaterials.find((r) => r.id === ing.id);
        return {
          id: ing.id,
          name: rm ? rm.name : "Unknown",
          qty: Number(ing.qty),
          unit: rm ? rm.unit : "kg",
        };
      }),
    };

    setRecipes((prev) => {
      // Overwrite existing product recipe if exists, otherwise append
      const filtered = prev.filter((r) => r.productId !== productId);
      return [...filtered, newRecipe];
    });

    showToast(
      "Recipe Saved",
      `Bill of Materials (BOM) for ${prod.name} successfully updated.`,
      "success",
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        user,
        setUser,
        login,
        logout,
        currentBranch,
        setCurrentBranch,
        currentShift,
        setCurrentShift,
        rawMaterials,
        setRawMaterials,
        products,
        recipes,
        productionLogs,
        wasteLogs,
        purchaseOrders,
        salesOrders,
        qualityLogs,
        suppliers,
        customers,
        activities,
        notifications,
        toasts,
        showToast,
        removeToast,
        logActivity,
        addWaste,
        createProductionEntry,
        completeProductionQC,
        addQualityLog,
        updateQualityLogStatus,
        receivePurchaseOrder,
        approvePurchaseOrder,
        createPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        deliverSalesOrder,
        createSalesOrder,
        addProduct,
        addSupplier,
        addCustomer,
        addRecipe,
        updateProfile,
        updatePassword,
        notificationsEnabled,
        setNotificationsEnabled,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
