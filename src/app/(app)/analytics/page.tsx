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
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";
import type { DepartmentAnalytics, CountryAnalytics } from "@/types";

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

function CustomTooltip({ active, payload, label }: {active?: boolean; payload?: {value: number; name: string}[]; label?: string}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      {label && <div style={{ color: "var(--text-secondary)", marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: "var(--text-primary)", marginBottom: 2 }}>
          <span style={{ color: "var(--text-muted)" }}>{p.name}: </span>
          {typeof p.value === "number" ? formatCompact(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [byDept, setByDept] = useState<DepartmentAnalytics[]>([]);
  const [byCountry, setByCountry] = useState<CountryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [d, c] = await Promise.all([
          fetch("/api/analytics/by-department").then((r) => r.json()),
          fetch("/api/analytics/by-country").then((r) => r.json()),
        ]);
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
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Salary insights and compensation analysis across ACME</p>
        </div>
      </div>

      <div className="page-body">
        {/* Department Analytics */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Salary Range by Department</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Min / Avg / Max base salary · Active employees</span>
          </div>
          <div className="card-body" style={{ padding: "16px 8px" }}>
            {loading ? (
              <div className="skeleton" style={{ height: 320, borderRadius: 8 }} />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byDept} layout="vertical" margin={{ left: 16, right: 48, top: 8, bottom: 8 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${formatCompact(v)}`}
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={120}
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-glow)" }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{v}</span>} />
                  <Bar dataKey="minSalary" name="Min" fill="#ef4444" opacity={0.7} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="averageSalary" name="Avg" fill="#3b82f6" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="maxSalary" name="Max" fill="#10b981" opacity={0.7} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department Payroll Table */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">Department Breakdown</span>
          </div>
          <div className="table-container" id="department-analytics-table">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Min Salary</th>
                  <th>Avg Salary</th>
                  <th>Max Salary</th>
                  <th>Total Payroll</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array(10).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j}>
                            <div className="skeleton" style={{ height: 16, width: j === 0 ? 140 : 80 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : byDept.map((d, i) => (
                      <tr key={d.department}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: CHART_COLORS[i % CHART_COLORS.length],
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 600 }}>{d.department}</span>
                          </div>
                        </td>
                        <td>{d.employeeCount.toLocaleString()}</td>
                        <td style={{ color: "var(--danger)" }}>${formatCompact(d.minSalary)}</td>
                        <td style={{ color: "var(--accent)", fontWeight: 600 }}>${formatCompact(d.averageSalary)}</td>
                        <td style={{ color: "var(--success)" }}>${formatCompact(d.maxSalary)}</td>
                        <td style={{ fontWeight: 700 }}>${formatCompact(d.totalPayroll)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Country Payroll Summary</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Salaries in local currency</span>
          </div>
          <div className="card-body" style={{ padding: "16px 8px" }}>
            {loading ? (
              <div className="skeleton" style={{ height: 280, borderRadius: 8 }} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byCountry} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="country"
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCompact(v)}
                    tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-glow)" }} />
                  <Bar dataKey="employeeCount" name="Employees" radius={[4, 4, 0, 0]}>
                    {byCountry.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Country table */}
          <div className="table-container" id="country-analytics-table">
            <table>
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
                        <td style={{ fontWeight: 700, color: "var(--success)" }}>
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
