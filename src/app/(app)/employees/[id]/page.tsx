"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  UserX,
  Plus,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, yearsOfService } from "@/lib/utils";
import type { Employee, SalaryRecord } from "@/types";
import AddSalaryModal from "@/components/AddSalaryModal";
import EditEmployeeModal from "@/components/EditEmployeeModal";

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "var(--accent-glow)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} color="var(--accent)" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
      </div>
    </div>
  );
}

function getAvatarColor(name: string): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
    "#06b6d4", "#84cc16", "#f97316", "#ec4899",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [employee, setEmployee] = useState<(Employee & { salaryHistory: SalaryRecord[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSalary, setShowAddSalary] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) {
        router.push("/employees");
        return;
      }
      const data = await res.json();
      setEmployee(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleDeactivate() {
    if (!employee) return;
    const action = employee.status === "Active" ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} this employee?`)) return;
    setDeactivating(true);
    try {
      await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: employee.status === "Active" ? "Inactive" : "Active" }),
      });
      await load();
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div className="skeleton" style={{ width: 200, height: 28 }} />
        </div>
        <div className="page-body">
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
      </>
    );
  }

  if (!employee) return null;

  const latestSalary = employee.salaryHistory[0];
  const avatarColor = getAvatarColor(employee.firstName);
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/employees" className="btn btn-secondary btn-icon" id="back-to-employees">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="page-subtitle">{employee.employeeId} · {employee.position}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowEdit(true)}
            id="edit-employee-btn"
          >
            <Edit size={15} />
            Edit
          </button>
          <button
            className={`btn ${employee.status === "Active" ? "btn-danger" : "btn-secondary"}`}
            onClick={handleDeactivate}
            disabled={deactivating}
            id="deactivate-employee-btn"
          >
            <UserX size={15} />
            {employee.status === "Active" ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          {/* Left: Profile Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <div className="card-body">
                {/* Avatar */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 20,
                      background: `${avatarColor}25`,
                      color: avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 800,
                      margin: "0 auto 12px",
                      border: `2px solid ${avatarColor}40`,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                    {employee.email}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span className={`badge ${employee.status === "Active" ? "badge-active" : "badge-inactive"}`}>
                      {employee.status === "Active" ? "● Active" : "○ Inactive"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <InfoItem icon={Building2} label="Department" value={employee.department} />
                  <InfoItem icon={Briefcase} label="Position" value={employee.position} />
                  <InfoItem icon={MapPin} label="Country" value={`${employee.country} (${employee.currency})`} />
                  <InfoItem icon={Calendar} label="Start Date" value={formatDate(employee.startDate)} />
                  <InfoItem icon={Clock} label="Tenure" value={`${yearsOfService(employee.startDate)} year(s)`} />
                  <InfoItem
                    icon={DollarSign}
                    label="Gender"
                    value={employee.gender}
                  />
                </div>
              </div>
            </div>

            {/* Current Salary Card */}
            {latestSalary && (
              <div className="card" style={{ border: "1px solid var(--border-light)" }}>
                <div className="card-header">
                  <span className="card-title">Current Compensation</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddSalary(true)}
                    id="update-salary-btn"
                  >
                    <Plus size={12} />
                    Update
                  </button>
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Base Salary
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>
                      {formatCurrency(latestSalary.baseSalary, employee.currency)}
                    </div>
                  </div>
                  {latestSalary.bonus > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        Bonus
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--success)" }}>
                        +{formatCurrency(latestSalary.bonus, employee.currency)}
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      background: "var(--accent-glow)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Total Compensation</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>
                      {formatCurrency(latestSalary.baseSalary + latestSalary.bonus, employee.currency)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
                    Effective {formatDate(latestSalary.effectiveDate)} · {latestSalary.reason}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Salary History */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Salary History</span>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddSalary(true)}
                id="add-salary-record-btn"
              >
                <Plus size={12} />
                Add Record
              </button>
            </div>
            <div className="card-body">
              {employee.salaryHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <div className="empty-state-title">No salary records yet</div>
                  <div className="empty-state-text">
                    Add the first salary record for this employee.
                  </div>
                </div>
              ) : (
                <div className="salary-timeline" id="salary-history-timeline">
                  {employee.salaryHistory.map((record, index) => (
                    <div key={record.id} className="salary-timeline-item">
                      <div className="timeline-dot">
                        <DollarSign size={14} color="var(--accent)" />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-reason">
                          {record.reason ?? "Salary Update"}
                          {index === 0 && (
                            <span
                              style={{
                                marginLeft: 8,
                                background: "var(--accent-glow)",
                                color: "var(--accent)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontSize: 10,
                              }}
                            >
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="timeline-salary">
                          {formatCurrency(record.baseSalary, employee.currency)}
                          {record.bonus > 0 && (
                            <span style={{ fontSize: 14, color: "var(--success)", marginLeft: 8 }}>
                              +{formatCurrency(record.bonus, employee.currency)}
                            </span>
                          )}
                        </div>
                        <div className="timeline-date">
                          Effective {formatDate(record.effectiveDate)}
                          <span style={{ marginLeft: 8, color: "var(--success)", fontWeight: 600 }}>
                            Total: {formatCurrency(record.baseSalary + record.bonus, employee.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddSalary && (
        <AddSalaryModal
          employeeId={id}
          currency={employee.currency}
          onClose={() => setShowAddSalary(false)}
          onSuccess={() => {
            setShowAddSalary(false);
            load();
          }}
        />
      )}
      {showEdit && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </>
  );
}
