"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, DollarSign, Globe, Building2, TrendingUp, UserCheck } from "lucide-react";
import Link from "next/link";
import type { AnalyticsSummary, DepartmentAnalytics, CountryAnalytics } from "@/types";

const CHART_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
];

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20` }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-delta">{sub}</div>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: {active?: boolean; payload?: {value: number; name: string}[]; label?: string}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {p.name}: {typeof p.value === "number" ? formatCompact(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byDept, setByDept] = useState<DepartmentAnalytics[]>([]);
  const [byCountry, setByCountry] = useState<CountryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, d, c] = await Promise.all([
          fetch("/api/analytics/summary").then((r) => r.json()),
          fetch("/api/analytics/by-department").then((r) => r.json()),
          fetch("/api/analytics/by-country").then((r) => r.json()),
        ]);
        setSummary(s);
        setByDept(d);
        setByCountry(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time salary insights across ACME organization
          </p>
        </div>
        <Link href="/employees/new" className="btn btn-primary" id="dashboard-add-employee">
          <Users size={16} />
          Add Employee
        </Link>
      </div>

      <div className="page-body">
        {/* Stats Grid */}
        {loading ? (
          <div className="stats-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div>
                  <div className="skeleton" style={{ width: 80, height: 28, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: 120, height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="stats-grid">
            <StatCard
              icon={Users}
              label="Total Employees"
              value={summary.totalEmployees.toLocaleString()}
              color="#3b82f6"
            />
            <StatCard
              icon={UserCheck}
              label="Active Employees"
              value={summary.activeEmployees.toLocaleString()}
              sub={`${((summary.activeEmployees / summary.totalEmployees) * 100).toFixed(1)}% active`}
              color="#10b981"
            />
            <StatCard
              icon={DollarSign}
              label="Total Payroll (USD)"
              value={`$${formatCompact(summary.totalPayroll)}`}
              sub="Active employees only"
              color="#f59e0b"
            />
            <StatCard
              icon={TrendingUp}
              label="Average Salary"
              value={`$${formatCompact(summary.averageSalary)}`}
              color="#8b5cf6"
            />
            <StatCard
              icon={Building2}
              label="Departments"
              value={String(summary.departmentCount)}
              color="#06b6d4"
            />
            <StatCard
              icon={Globe}
              label="Countries"
              value={String(summary.countryCount)}
              color="#ec4899"
            />
          </div>
        ) : null}

        {/* Charts */}
        <div className="charts-grid">
          {/* Department chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Avg. Salary by Department</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Active employees</span>
            </div>
            <div className="card-body" style={{ padding: "16px 8px" }}>
              {loading ? (
                <div className="skeleton" style={{ height: 260, borderRadius: 8 }} />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byDept} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `$${formatCompact(v)}`}
                      tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="department"
                      width={110}
                      tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-glow)" }} />
                    <Bar dataKey="averageSalary" name="Avg Salary" radius={[0, 4, 4, 0]}>
                      {byDept.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Country distribution */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Headcount by Country</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Top countries</span>
            </div>
            <div className="card-body" style={{ padding: "16px 8px" }}>
              {loading ? (
                <div className="skeleton" style={{ height: 260, borderRadius: 8 }} />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={byCountry.slice(0, 8)}
                      dataKey="employeeCount"
                      nameKey="country"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {byCountry.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Country payroll table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Payroll by Country</span>
            <Link href="/analytics" className="btn btn-secondary btn-sm" id="view-full-analytics">
              View full analytics →
            </Link>
          </div>
          <div className="table-container">
            <table id="country-payroll-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Currency</th>
                  <th>Employees</th>
                  <th>Avg. Salary</th>
                  <th>Total Payroll</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(5).fill(0).map((_, j) => (
                          <td key={j}>
                            <div className="skeleton" style={{ height: 16, width: j === 0 ? 120 : 80 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : byCountry.map((c) => (
                      <tr key={c.country}>
                        <td style={{ fontWeight: 600 }}>{c.country}</td>
                        <td>
                          <span className="badge badge-country">{c.currency}</span>
                        </td>
                        <td>{c.employeeCount.toLocaleString()}</td>
                        <td>{formatCompact(c.averageSalary)} {c.currency}</td>
                        <td style={{ fontWeight: 600, color: "var(--success)" }}>
                          {formatCompact(c.totalPayroll)} {c.currency}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
