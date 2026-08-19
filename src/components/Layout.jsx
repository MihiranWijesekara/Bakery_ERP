import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  FiHome, FiDatabase, FiCpu, FiShoppingCart, FiCheckSquare, 
  FiPieChart, FiSettings, FiMenu, FiChevronLeft, FiChevronRight, FiSun, 
  FiMoon, FiBell, FiSearch, FiLogOut, FiUser, FiCalendar, FiClock, FiStar,
  FiHelpCircle
} from 'react-icons/fi';

export const Layout = ({ children, activePage, setActivePage, setSubActiveTab }) => {
  const { 
    theme, setTheme, user, logout, notifications, clearNotifications,
    rawMaterials, products, suppliers, customers, productionLogs, purchaseOrders, salesOrders
  } = useContext(AppContext);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Track recently opened & favorites
  const [recentPages, setRecentPages] = useState(['Dashboard']);
  const [favorites, setFavorites] = useState(['Dashboard', 'Inventory', 'Production']);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync recent pages
  const navigateTo = (pageName, subTab = '') => {
    setActivePage(pageName);
    if (subTab && setSubActiveTab) {
      setSubActiveTab(subTab);
    }
    setRecentPages(prev => {
      const filtered = prev.filter(p => p !== pageName);
      return [pageName, ...filtered].slice(0, 5); // Keep last 5
    });
    setMobileOpen(false);
  };

  const toggleFavorite = (pageName) => {
    setFavorites(prev => {
      if (prev.includes(pageName)) {
        return prev.filter(p => p !== pageName);
      }
      return [...prev, pageName];
    });
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd': navigateTo('Dashboard'); break;
          case 'i': navigateTo('Inventory'); break;
          case 'p': navigateTo('Production'); break;
          case 'u': navigateTo('Purchasing'); break;
          case 'q': navigateTo('Quality Control'); break;
          case 'r': navigateTo('Reports'); break;
          case 't': navigateTo('Settings'); break;
          default: break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Search logic
  const getSearchResults = () => {
    if (!searchQuery) return { products: [], ingredients: [], orders: [], suppliers: [], pages: [] };
    const query = searchQuery.toLowerCase();

    const matchedProducts = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)).slice(0, 3);
    const matchedRms = rawMaterials.filter(r => r.name.toLowerCase().includes(query)).slice(0, 3);
    const matchedSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(query) || s.items.toLowerCase().includes(query)).slice(0, 2);
    
    const matchedOrders = [
      ...purchaseOrders.filter(po => po.poNumber.toLowerCase().includes(query)),
      ...salesOrders.filter(so => so.soNumber.toLowerCase().includes(query)),
      ...productionLogs.filter(p => p.id.toLowerCase().includes(query))
    ].slice(0, 4);

    const erpPages = ['Dashboard', 'Inventory', 'Production', 'Purchasing', 'Quality Control', 'Reports', 'Settings'];
    const matchedPages = erpPages.filter(p => p.toLowerCase().includes(query)).slice(0, 3);

    return {
      products: matchedProducts,
      ingredients: matchedRms,
      suppliers: matchedSuppliers,
      orders: matchedOrders,
      pages: matchedPages
    };
  };

  const results = getSearchResults();
  const hasResults = Object.values(results).some(arr => arr.length > 0);
  const unreadNotifs = notifications.filter(n => n.unread).length;

  const sidebarItems = [
    { name: 'Dashboard', icon: <FiHome />, category: 'Core' },
    { name: 'Inventory', icon: <FiDatabase />, category: 'Operations' },
    { name: 'Production', icon: <FiCpu />, category: 'Operations' },
    { name: 'Purchasing', icon: <FiShoppingCart />, category: 'Finance & Supply' },
    { name: 'Quality Control', icon: <FiCheckSquare />, category: 'Operations' },
    { name: 'Reports', icon: <FiPieChart />, category: 'Core' },
    { name: 'Settings', icon: <FiSettings />, category: 'Core' }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">🍞</div>
          <span className="sidebar-title">BakeFlow ERP</span>
        </div>

        <nav className="sidebar-nav">
          {/* Favorites List in Sidebar for fast access */}
          {favorites.length > 0 && !collapsed && (
            <>
              <div className="sidebar-menu-title">★ Favourites</div>
              {favorites.map(favName => {
                const item = sidebarItems.find(i => i.name === favName);
                if (!item) return null;
                return (
                  <div 
                    key={`fav-${favName}`} 
                    className={`sidebar-item ${activePage === favName ? 'active' : ''}`}
                    onClick={() => navigateTo(favName)}
                  >
                    <span className="sidebar-item-icon" style={{color: '#f59e0b'}}><FiStar /></span>
                    <span className="sidebar-item-label">{favName}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Grouped Sidebar menus */}
          {['Core', 'Operations', 'Finance & Supply'].map(cat => {
            const items = sidebarItems.filter(i => i.category === cat);
            return (
              <React.Fragment key={cat}>
                <div className="sidebar-menu-title">{cat}</div>
                {items.map(item => (
                  <div
                    key={item.name}
                    className={`sidebar-item ${activePage === item.name ? 'active' : ''}`}
                    onClick={() => navigateTo(item.name)}
                    title={item.name}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.name}</span>
                    <span 
                      style={{marginLeft: 'auto', opacity: 0.3, cursor: 'pointer'}} 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.name);
                      }}
                      title={favorites.includes(item.name) ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      <FiStar fill={favorites.includes(item.name) ? '#f59e0b' : 'none'} stroke={favorites.includes(item.name) ? '#f59e0b' : 'currentColor'} size={12} />
                    </span>
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Sidebar Collapse button */}
        <div className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <div className="menu-toggle-mobile" onClick={() => setMobileOpen(!mobileOpen)}>
              <FiMenu />
            </div>

            {/* Breadcrumbs */}
            <div className="breadcrumbs-container" style={{ margin: 0 }}>
              <span className="breadcrumb-link" onClick={() => navigateTo('Dashboard')}>Home</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{activePage}</span>
            </div>
          </div>

          <div className="navbar-right">
            {/* Global Search Bar */}
            <div className="global-search-container" ref={searchRef}>
              <FiSearch className="global-search-icon" />
              <input
                type="text"
                className="global-search-input"
                placeholder="Search products, ingredients, POs... (Ctrl+/)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />

              {/* Live search dropdown suggestions */}
              {showSearchDropdown && searchQuery && (
                <div className="search-suggestions-dropdown">
                  {!hasResults ? (
                    <div style={{ padding: '16px', textStyle: 'italic', fontSize: '12px', color: 'var(--text-muted)' }}>
                      No matches found for "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {results.pages.length > 0 && (
                        <div className="search-suggestion-group">
                          <div className="search-suggestion-header">Pages</div>
                          {results.pages.map(p => (
                            <div key={p} className="search-suggestion-item" onClick={() => { navigateTo(p); setSearchQuery(''); setShowSearchDropdown(false); }}>
                              <span>Go to {p}</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Module</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {results.products.length > 0 && (
                        <div className="search-suggestion-group">
                          <div className="search-suggestion-header">Products</div>
                          {results.products.map(p => (
                            <div key={p.id} className="search-suggestion-item" onClick={() => { navigateTo('Inventory'); setSearchQuery(''); setShowSearchDropdown(false); }}>
                              <span>{p.name}</span>
                              <span style={{ fontSize: '10px', color: 'var(--success)' }}>Price: ${p.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {results.ingredients.length > 0 && (
                        <div className="search-suggestion-group">
                          <div className="search-suggestion-header">Raw Materials</div>
                          {results.ingredients.map(r => (
                            <div key={r.id} className="search-suggestion-item" onClick={() => { navigateTo('Inventory'); setSearchQuery(''); setShowSearchDropdown(false); }}>
                              <span>{r.name}</span>
                              <span style={{ fontSize: '10px', color: r.stock < r.minStock ? 'var(--danger)' : 'var(--text-muted)' }}>Stock: {r.stock} {r.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {results.orders.length > 0 && (
                        <div className="search-suggestion-group">
                          <div className="search-suggestion-header">Orders & Batches</div>
                          {results.orders.map(o => {
                            const isPO = o.poNumber !== undefined;
                            const isSO = o.soNumber !== undefined;
                            const label = isPO ? o.poNumber : (isSO ? o.soNumber : `Batch #${o.id.substring(0,6)}`);
                            const targetPage = isPO ? 'Purchasing' : (isSO ? 'Sales' : 'Production');
                            return (
                              <div key={o.id} className="search-suggestion-item" onClick={() => { navigateTo(targetPage); setSearchQuery(''); setShowSearchDropdown(false); }}>
                                <span>{label}</span>
                                <span style={{ fontSize: '10px', color: 'var(--primary)' }}>{targetPage} ({o.status})</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Recently Visited Drawer dropdown (Shortcut helper) */}
            <div style={{ position: 'relative' }}>
              <button className="nav-icon-btn" title="Recent Pages">
                <FiClock />
              </button>
              {/* Add keyboard helper hovering */}
            </div>

            {/* Notifications Alert Bell */}
            <div className="nav-icon-wrapper" style={{ position: 'relative' }} ref={notifRef}>
              <button 
                className="nav-icon-btn" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) clearNotifications();
                }}
              >
                <FiBell />
                {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
              </button>

              {showNotifications && (
                <div className="notifications-drawer">
                  <div className="notifications-drawer-header">
                    <span>Notifications ({notifications.length})</span>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={clearNotifications}
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="notifications-drawer-body">
                    {notifications.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{n.title}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.desc}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button className="nav-icon-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} title="Toggle Theme">
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>

            {/* Profile Menu */}
            <div className="nav-profile-container" style={{ position: 'relative' }} ref={profileRef}>
              <div className="nav-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="nav-avatar">{user ? user.avatar : 'GU'}</div>
                <div className="nav-profile-info">
                  <span className="nav-username">{user ? user.name : 'Guest User'}</span>
                  <span className="nav-role">{user ? user.role : 'Operations'}</span>
                </div>
              </div>

              {showProfileDropdown && (
                <div className="notifications-drawer" style={{ right: 0, width: '180px' }}>
                  <div style={{ padding: '8px' }}>
                    <div className="sidebar-item" onClick={() => { navigateTo('Settings'); setShowProfileDropdown(false); }}>
                      <FiUser /> <span style={{ fontSize: '12px' }}>My Profile</span>
                    </div>
                    <div className="sidebar-item" onClick={() => { navigateTo('Settings'); setShowProfileDropdown(false); }}>
                      <FiSettings /> <span style={{ fontSize: '12px' }}>System Setup</span>
                    </div>
                    <div className="sidebar-item" onClick={() => { logout(); setShowProfileDropdown(false); }} style={{ color: 'var(--danger)' }}>
                      <FiLogOut /> <span style={{ fontSize: '12px' }}>Logout</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};
