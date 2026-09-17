"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

const POSITIONS_BY_DEPT: Record<string, string[]> = {
  Engineering: ["Software Engineer I", "Software Engineer II", "Senior Software Engineer", "Staff Engineer", "Principal Engineer", "Engineering Manager"],
  Product: ["Product Manager", "Senior Product Manager", "Principal PM", "Director of Product"],
  Design: ["UX Designer", "Senior UX Designer", "Product Designer", "Design Lead", "Head of Design"],
  Marketing: ["Marketing Associate", "Marketing Manager", "Senior Marketing Manager", "Head of Marketing", "CMO"],
  Sales: ["Sales Development Rep", "Account Executive", "Senior AE", "Sales Manager", "VP of Sales"],
  Finance: ["Financial Analyst", "Senior Financial Analyst", "Finance Manager", "Controller", "CFO"],
  "Human Resources": ["HR Coordinator", "HR Generalist", "Senior HR Manager", "HR Director", "CHRO"],
  Operations: ["Operations Analyst", "Operations Manager", "Senior Operations Manager", "VP of Operations", "COO"],
  "Customer Success": ["Customer Success Manager", "Senior CSM", "CS Team Lead", "VP of Customer Success"],
  Legal: ["Legal Counsel", "Senior Legal Counsel", "Associate General Counsel", "General Counsel"],
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  department: string;
  position: string;
  country: string;
  currency: string;
  status: string;
  startDate: string;
  baseSalary: string;
  bonus: string;
  salaryReason: string;
};

type Errors = Partial<Record<keyof FormData, string>>;

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "Male",
    department: "Engineering",
    position: "Software Engineer I",
    country: "United States",
    currency: "USD",
    status: "Active",
    startDate: new Date().toISOString().split("T")[0],
    baseSalary: "",
    bonus: "0",
    salaryReason: "Initial",
  });

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-set currency when country changes
      if (field === "country") {
        const cc = COUNTRIES.find((c) => c.name === value);
        if (cc) next.currency = cc.currency;
      }
      // Auto-set first position when department changes
      if (field === "department") {
        const positions = POSITIONS_BY_DEPT[value] ?? [];
        next.position = positions[0] ?? "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Errors = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.includes("@")) errs.email = "Invalid email";
    if (!form.baseSalary || Number(form.baseSalary) < 0) errs.baseSalary = "Enter a valid salary";
    if (!form.startDate) errs.startDate = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          baseSalary: Number(form.baseSalary),
          bonus: Number(form.bonus) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("email")) {
          setErrors({ email: "Email already exists" });
        }
        return;
      }

      const emp = await res.json();
      router.push(`/employees/${emp.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const positions = POSITIONS_BY_DEPT[form.department] ?? [];

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/employees" className="btn btn-secondary btn-icon" id="back-from-new">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Add Employee</h1>
            <p className="page-subtitle">Create a new employee record</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <form id="new-employee-form" onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Personal Info */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Personal Information</span>
              </div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      className="form-input"
                      value={form.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      placeholder="John"
                    />
                    {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName"
                      className="form-input"
                      value={form.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Doe"
                    />
                    {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-email">Email *</label>
                  <input
                    id="new-email"
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john.doe@acme.com"
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      className="form-select"
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="form-select"
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">Start Date *</label>
                  <input
                    id="startDate"
                    type="date"
                    className="form-input"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                  {errors.startDate && <div className="form-error">{errors.startDate}</div>}
                </div>
              </div>
            </div>

            {/* Job & Location */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Job & Location</span>
              </div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department</label>
                  <select
                    id="department"
                    className="form-select"
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="position">Position</label>
                  <select
                    id="position"
                    className="form-select"
                    value={form.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                  >
                    {positions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="country">Country</label>
                  <select
                    id="country"
                    className="form-select"
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <input
                    id="currency"
                    className="form-input"
                    value={form.currency}
                    onChange={(e) => handleChange("currency", e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">Initial Salary</span>
            </div>
            <div className="card-body">
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="baseSalary">Base Salary ({form.currency}) *</label>
                  <input
                    id="baseSalary"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.baseSalary}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                    placeholder="75000"
                  />
                  {errors.baseSalary && <div className="form-error">{errors.baseSalary}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bonus">Bonus ({form.currency})</label>
                  <input
                    id="bonus"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.bonus}
                    onChange={(e) => handleChange("bonus", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="salaryReason">Reason</label>
                  <select
                    id="salaryReason"
                    className="form-select"
                    value={form.salaryReason}
                    onChange={(e) => handleChange("salaryReason", e.target.value)}
                  >
                    <option value="Initial">Initial</option>
                    <option value="Annual Review">Annual Review</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Market Adjustment">Market Adjustment</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Link href="/employees" className="btn btn-secondary" id="cancel-new-employee">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-employee-btn"
            >
              {saving ? "Saving…" : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
