"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  employeeId: string;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSalaryModal({ employeeId, currency, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    baseSalary: "",
    bonus: "0",
    effectiveDate: new Date().toISOString().split("T")[0],
    reason: "Annual Review",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.baseSalary || Number(form.baseSalary) < 0) {
      setError("Please enter a valid salary");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseSalary: Number(form.baseSalary),
          bonus: Number(form.bonus) || 0,
          effectiveDate: form.effectiveDate,
          reason: form.reason,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add salary record");
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
      <div className="modal" id="add-salary-modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Salary Record</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose} id="close-salary-modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="salary-form">
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="modal-baseSalary">
                Base Salary ({currency}) *
              </label>
              <input
                id="modal-baseSalary"
                type="number"
                min="0"
                className="form-input"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                placeholder="75000"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-bonus">
                Bonus ({currency})
              </label>
              <input
                id="modal-bonus"
                type="number"
                min="0"
                className="form-input"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-effectiveDate">
                Effective Date *
              </label>
              <input
                id="modal-effectiveDate"
                type="date"
                className="form-input"
                value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="modal-reason">
                Reason
              </label>
              <select
                id="modal-reason"
                className="form-select"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              >
                <option value="Annual Review">Annual Review</option>
                <option value="Promotion">Promotion</option>
                <option value="Market Adjustment">Market Adjustment</option>
                <option value="Initial">Initial</option>
                <option value="Other">Other</option>
              </select>
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
              id="cancel-salary-modal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-salary-record"
            >
              {saving ? "Saving…" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
