import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiDownload,
  FiCheckSquare,
  FiSquare,
  FiMoreVertical,
} from "react-icons/fi";

export const Table = ({
  columns,
  data,
  title,
  searchPlaceholder = "Search items...",
  actions,
  bulkActions,
  filterField,
  filterOptions = [],
  filterLabel = "Filter",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedFilter, setSelectedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Handle Sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter & Search Logic
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply Dropdown Filter
    if (selectedFilter && filterField) {
      result = result.filter((item) => {
        const val = item[filterField];
        return (
          val && val.toString().toLowerCase() === selectedFilter.toLowerCase()
        );
      });
    }

    // Apply Global Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          const val = item[col.accessor];
          return val && val.toString().toLowerCase().includes(query);
        });
      });
    }

    // Apply Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Parse numerical values if possible
        if (typeof aVal === "string" && !isNaN(Number(aVal)))
          aVal = Number(aVal);
        if (typeof bVal === "string" && !isNaN(Number(bVal)))
          bVal = Number(bVal);

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, columns, searchQuery, sortConfig, selectedFilter, filterField]);

  // Pagination Logic
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Reset page when queries change
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchQuery, selectedFilter]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const newSelect = new Set(paginatedData.map((item) => item.id));
      setSelectedRows(newSelect);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = columns.map((col) => col.header).join(",");
    const rows = processedData.map((item) => {
      return columns
        .map((col) => {
          let val = item[col.accessor];
          if (typeof val === "object" && val !== null) {
            val = JSON.stringify(val).replace(/"/g, '""');
          }
          return `"${val !== undefined ? val : ""}"`;
        })
        .join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${title ? title.toLowerCase().replace(/\s+/g, "_") : "table_data"}_export.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="table-container">
      {/* Table Header Controls */}
      <div className="table-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {title && <h3 className="table-title">{title}</h3>}
          <span className="badge badge-primary">{totalItems} records</span>
        </div>

        <div className="table-actions">
          {/* Global Search */}
          <div className="table-search">
            <FiSearch className="table-search-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Optional Dropdown Filter */}
          {filterField && filterOptions.length > 0 && (
            <select
              className="form-control"
              style={{ width: "auto", padding: "6px 12px", fontSize: "12px" }}
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="">All {filterLabel}s</option>
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Export Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportToCSV}
            title="Export CSV"
          >
            <FiDownload /> Export
          </button>

          {/* Custom Actions passed as prop */}
          {actions}
        </div>
      </div>

      {/* Bulk actions banner if rows selected */}
      {selectedRows.size > 0 && bulkActions && (
        <div
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--primary-light)",
            borderBottom: "1px solid var(--surface-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--primary)",
            }}
          >
            {selectedRows.size} row(s) selected
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {bulkActions(Array.from(selectedRows), () =>
              setSelectedRows(new Set()),
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="enterprise-table">
          <thead>
            <tr>
              {/* Select All Checkbox */}
              {bulkActions && (
                <th style={{ width: "40px", textAlign: "center" }}>
                  <span
                    onClick={handleSelectAll}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {selectedRows.size === paginatedData.length &&
                    paginatedData.length > 0 ? (
                      <FiCheckSquare size={16} color="var(--primary)" />
                    ) : (
                      <FiSquare size={16} />
                    )}
                  </span>
                </th>
              )}

              {/* Data Headers */}
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  style={{
                    width: col.width,
                    cursor: col.sortable !== false ? "pointer" : "default",
                  }}
                  onClick={() =>
                    col.sortable !== false && requestSort(col.accessor)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {col.header}
                    {col.sortable !== false &&
                      sortConfig.key === col.accessor &&
                      (sortConfig.direction === "asc" ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "var(--text-muted)",
                  }}
                >
                  No records matching the filters were found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIndex) => (
                <tr
                  key={row.id || rIndex}
                  className={selectedRows.has(row.id) ? "selected-row" : ""}
                >
                  {/* Select Row Checkbox */}
                  {bulkActions && (
                    <td style={{ textAlign: "center" }}>
                      <span
                        onClick={() => handleSelectRow(row.id)}
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {selectedRows.has(row.id) ? (
                          <FiCheckSquare size={16} color="var(--primary)" />
                        ) : (
                          <FiSquare size={16} />
                        )}
                      </span>
                    </td>
                  )}

                  {/* Cell Rendering */}
                  {columns.map((col) => {
                    const cellValue = row[col.accessor];
                    return (
                      <td key={col.accessor}>
                        {col.cell
                          ? col.cell(row)
                          : cellValue !== undefined
                            ? cellValue
                            : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination">
        <div>
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Page size select */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Show:</span>
            <select
              className="form-control"
              style={{ width: "60px", padding: "4px", fontSize: "12px" }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 25, 50].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="pagination-btn-group">
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
