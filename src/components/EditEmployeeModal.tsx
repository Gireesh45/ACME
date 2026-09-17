"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Employee } from "@/types";

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Finance", "Human Resources", "Operations", "Customer Success", "Legal",
];

const COUNTRIES = [
  { name: "United States", currency: "USD" },
  { name: "India", currency: "INR" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Germany", currency: "EUR" },
  { name: "Canada", currency: "CAD" },
  { name: "Australia", currency: "AUD" },
  { name: "Singapore", currency: "SGD" },
  { name: "France", currency: "EUR" },
  { name: "Brazil", currency: "BRL" },
  { name: "Netherlands", currency: "EUR" },
  { name: "Japan", currency: "JPY" },
  { name: "UAE", currency: "AED" },
  { name: "Other", currency: "USD" },
];

interface Props {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmployeeModal({ employee, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    gender: employee.gender,
    department: employee.department,
    position: employee.position,
    country: employee.country,
    currency: employee.currency,
    status: employee.status,
    startDate: new Date(employee.startDate).toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update employee");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" id="edit-employee-modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Employee</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} id="close-edit-modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="edit-employee-form">
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-firstName">First Name</label>
                <input
                  id="edit-firstName"
                  className="form-input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-lastName">Last Name</label>
                <input
                  id="edit-lastName"
                  className="form-input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-department">Department</label>
                <select
                  id="edit-department"
                  className="form-select"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-position">Position</label>
                <input
                  id="edit-position"
                  className="form-input"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-country">Country</label>
                <select
                  id="edit-country"
                  className="form-select"
                  value={form.country}
                  onChange={(e) => {
                    const cc = COUNTRIES.find((c) => c.name === e.target.value);
                    setForm({ ...form, country: e.target.value, currency: cc?.currency ?? form.currency });
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-startDate">Start Date</label>
                <input
                  id="edit-startDate"
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "var(--danger-bg)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "var(--danger)",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              id="cancel-edit-modal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-edit-employee"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
