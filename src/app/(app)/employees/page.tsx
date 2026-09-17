"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import type { PaginatedResponse, EmployeeWithLatestSalary } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Finance", "Human Resources", "Operations", "Customer Success", "Legal",
];

const COUNTRIES = [
  "United States", "India", "United Kingdom", "Germany", "Canada",
  "Australia", "Singapore", "France", "Brazil", "Netherlands", "Japan", "UAE",
];

function getAvatarColor(name: string): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

type SortField = "firstName" | "department" | "country" | "startDate" | "status" | "employeeId";
type SortOrder = "asc" | "desc";

export default function EmployeesPage() {
  const router = useRouter();

  const [data, setData] = useState<PaginatedResponse<EmployeeWithLatestSalary> | null>(null);
  // `loading` = true only on the very first fetch (shows skeleton rows)
  // `fetching` = true on subsequent filter/sort/page changes (keeps rows, dims table)
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [sortBy, setSortBy] = useState<SortField>("employeeId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const fetchEmployees = useCallback(async () => {
    // First load: show skeleton. Subsequent: just dim the existing rows.
    if (data === null) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(department && { department }),
        ...(country && { country }),
        ...(status && { status }),
        ...(gender && { gender }),
      });
      const res = await fetch(`/api/employees?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [page, pageSize, search, department, country, status, gender, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchEmployees, search]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [search, department, country, status, gender]);

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function handleExport() {
    const params = new URLSearchParams({
      ...(department && { department }),
      ...(country && { country }),
      ...(status && { status }),
    });
    window.open(`/api/employees/export?${params}`, "_blank");
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortBy !== field) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortOrder === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  const totalPages = data?.totalPages ?? 1;
  const employees = data?.data ?? [];
  const isBusy = loading || fetching;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {data ? `${data.total.toLocaleString()} employees` : "Loading…"}
            {fetching && (
              <span style={{
                width: 14, height: 14,
                border: "2px solid var(--border-light)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.7s linear infinite",
              }} />
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            id="export-csv-btn"
          >
            <Download size={15} />
            Export CSV
          </button>
          <Link href="/employees/new" className="btn btn-primary" id="add-employee-btn">
            <Plus size={16} />
            Add Employee
          </Link>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {/* Filters */}
          <div className="filters-bar">
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                id="employee-search"
                type="text"
                className="search-input"
                placeholder="Search by name, email, ID, position…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              id="filter-department"
              className="form-select"
              style={{ width: "auto", minWidth: 140 }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              id="filter-country"
              className="form-select"
              style={{ width: "auto", minWidth: 140 }}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              id="filter-status"
              className="form-select"
              style={{ width: "auto", minWidth: 110 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              id="filter-gender"
              className="form-select"
              style={{ width: "auto", minWidth: 100 }}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {(search || department || country || status || gender) && (
              <button
                className="btn btn-secondary btn-sm"
                id="clear-filters-btn"
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setCountry("");
                  setStatus("");
                  setGender("");
                }}
              >
                <Filter size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          {/* Progress bar — only shown during filter/sort/page refetch, not initial load */}
          <div style={{
            height: 2,
            background: "var(--border)",
            position: "relative",
            overflow: "hidden",
            opacity: fetching ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}>
            <div style={{
              position: "absolute",
              top: 0, left: 0, height: "100%",
              width: "40%",
              background: "linear-gradient(90deg, var(--accent), var(--purple))",
              animation: fetching ? "progressSlide 1s ease-in-out infinite" : "none",
              borderRadius: 2,
            }} />
          </div>
          <div className="table-container" id="employees-table"
            style={{ opacity: fetching ? 0.55 : 1, transition: "opacity 0.18s ease", pointerEvents: fetching ? "none" : "auto" }}
          >
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("employeeId")}
                    className={cn(sortBy === "employeeId" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      ID <SortIcon field="employeeId" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("firstName")}
                    className={cn(sortBy === "firstName" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Employee <SortIcon field="firstName" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("department")}
                    className={cn(sortBy === "department" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Department <SortIcon field="department" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("country")}
                    className={cn(sortBy === "country" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Country <SortIcon field="country" />
                    </div>
                  </th>
                  <th>Current Salary</th>
                  <th
                    onClick={() => handleSort("status")}
                    className={cn(sortBy === "status" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Status <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("startDate")}
                    className={cn(sortBy === "startDate" && "sorted")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      Start Date <SortIcon field="startDate" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(10).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j}>
                            <div className="skeleton" style={{ height: 16, width: j === 1 ? 160 : 80 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : employees.length === 0 && !fetching
                  ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <div className="empty-state-icon">🔍</div>
                          <div className="empty-state-title">No employees found</div>
                          <div className="empty-state-text">
                            Try adjusting your search filters or add a new employee.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                  : employees.map((emp) => {
                    const avatarColor = getAvatarColor(emp.firstName);
                    const initials = `${emp.firstName[0]}${emp.lastName[0]}`;
                    return (
                      <tr
                        key={emp.id}
                        onClick={() => router.push(`/employees/${emp.id}`)}
                        style={{ cursor: "pointer" }}
                        id={`employee-row-${emp.employeeId}`}
                      >
                        <td>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {emp.employeeId}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              className="emp-avatar"
                              style={{ background: `${avatarColor}20`, color: avatarColor }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="td-secondary">{emp.position}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-dept">{emp.department}</span>
                        </td>
                        <td>
                          <div>{emp.country}</div>
                          <div className="td-secondary">{emp.currency}</div>
                        </td>
                        <td>
                          {emp.currentBaseSalary != null ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {formatCurrency(emp.currentBaseSalary, emp.currency)}
                              </div>
                              {emp.currentBonus ? (
                                <div className="td-secondary">
                                  +{formatCurrency(emp.currentBonus, emp.currency)} bonus
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${emp.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                            {emp.status === "Active" ? "● Active" : "○ Inactive"}
                          </span>
                        </td>
                        <td className="td-secondary">{formatDate(emp.startDate)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              {data
                ? `Showing ${Math.min((page - 1) * pageSize + 1, data.total).toLocaleString()}–${Math.min(page * pageSize, data.total).toLocaleString()} of ${data.total.toLocaleString()} employees`
                : "Loading…"}
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                id="pagination-first"
                title="First page"
              >
                «
              </button>
              <button
                className="page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                id="pagination-prev"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (page <= 3) pageNum = i + 1;
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = page - 2 + i;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${page === pageNum ? "active" : ""}`}
                    onClick={() => setPage(pageNum)}
                    id={`pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                id="pagination-next"
              >
                <ChevronRight size={14} />
              </button>
              <button
                className="page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                id="pagination-last"
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
