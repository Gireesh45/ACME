import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";

// Load env vars
config({ path: ".env.local" });
config({ path: ".env" });

// Set up SQLite with driver adapter (Prisma 7 requirement)
// PrismaBetterSqlite3 takes a config object with a url property
const dbUrl = process.env.DATABASE_URL ?? "file:./data/salary.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });



// ── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Customer Success",
  "Legal",
];

const POSITIONS_BY_DEPT: Record<string, string[]> = {
  Engineering: [
    "Software Engineer I",
    "Software Engineer II",
    "Senior Software Engineer",
    "Staff Engineer",
    "Principal Engineer",
    "Engineering Manager",
  ],
  Product: [
    "Product Manager",
    "Senior Product Manager",
    "Principal PM",
    "Director of Product",
  ],
  Design: [
    "UX Designer",
    "Senior UX Designer",
    "Product Designer",
    "Design Lead",
    "Head of Design",
  ],
  Marketing: [
    "Marketing Associate",
    "Marketing Manager",
    "Senior Marketing Manager",
    "Head of Marketing",
    "CMO",
  ],
  Sales: [
    "Sales Development Rep",
    "Account Executive",
    "Senior AE",
    "Sales Manager",
    "VP of Sales",
  ],
  Finance: [
    "Financial Analyst",
    "Senior Financial Analyst",
    "Finance Manager",
    "Controller",
    "CFO",
  ],
  "Human Resources": [
    "HR Coordinator",
    "HR Generalist",
    "Senior HR Manager",
    "HR Director",
    "CHRO",
  ],
  Operations: [
    "Operations Analyst",
    "Operations Manager",
    "Senior Operations Manager",
    "VP of Operations",
    "COO",
  ],
  "Customer Success": [
    "Customer Success Manager",
    "Senior CSM",
    "CS Team Lead",
    "VP of Customer Success",
  ],
  Legal: [
    "Legal Counsel",
    "Senior Legal Counsel",
    "Associate General Counsel",
    "General Counsel",
  ],
};

const COUNTRY_CONFIG: Array<{
  country: string;
  currency: string;
  salaryMin: number;
  salaryMax: number;
  weight: number;
}> = [
  { country: "United States", currency: "USD", salaryMin: 60000, salaryMax: 250000, weight: 30 },
  { country: "India", currency: "INR", salaryMin: 600000, salaryMax: 4000000, weight: 25 },
  { country: "United Kingdom", currency: "GBP", salaryMin: 35000, salaryMax: 180000, weight: 10 },
  { country: "Germany", currency: "EUR", salaryMin: 40000, salaryMax: 160000, weight: 8 },
  { country: "Canada", currency: "CAD", salaryMin: 55000, salaryMax: 200000, weight: 7 },
  { country: "Australia", currency: "AUD", salaryMin: 60000, salaryMax: 200000, weight: 5 },
  { country: "Singapore", currency: "SGD", salaryMin: 50000, salaryMax: 200000, weight: 4 },
  { country: "France", currency: "EUR", salaryMin: 35000, salaryMax: 140000, weight: 3 },
  { country: "Brazil", currency: "BRL", salaryMin: 40000, salaryMax: 300000, weight: 3 },
  { country: "Netherlands", currency: "EUR", salaryMin: 40000, salaryMax: 150000, weight: 2 },
  { country: "Japan", currency: "JPY", salaryMin: 4000000, salaryMax: 15000000, weight: 2 },
  { country: "UAE", currency: "AED", salaryMin: 80000, salaryMax: 500000, weight: 1 },
];

const SALARY_REASONS = [
  "Annual Review",
  "Promotion",
  "Market Adjustment",
  "Annual Review",
  "Annual Review",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

function generateEmployeeId(index: number): string {
  return `EMP-${String(index).padStart(5, "0")}`;
}

function generateSalaryHistory(
  baseSalary: number,
  bonus: number,
  startDate: Date
): Array<{ baseSalary: number; bonus: number; effectiveDate: Date; reason: string }> {
  const history: Array<{ baseSalary: number; bonus: number; effectiveDate: Date; reason: string }> = [];

  // Initial salary on start date
  history.push({
    baseSalary,
    bonus,
    effectiveDate: startDate,
    reason: "Initial",
  });

  // Generate 1-4 subsequent reviews if employee has been around long enough
  const yearsEmployed = (Date.now() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const reviewCount = Math.min(Math.floor(yearsEmployed), Math.floor(Math.random() * 4));

  let currentSalary = baseSalary;
  let currentBonus = bonus;

  for (let i = 0; i < reviewCount; i++) {
    // Add ~3-15% annual increase
    const increasePercent = 0.03 + Math.random() * 0.12;
    currentSalary = Math.round(currentSalary * (1 + increasePercent));
    currentBonus = Math.round(currentBonus * (1 + Math.random() * 0.1));

    const yearsAgo = yearsEmployed - (i + 1);
    const reviewDate = new Date(startDate);
    reviewDate.setFullYear(reviewDate.getFullYear() + Math.floor(yearsEmployed - yearsAgo));

    history.push({
      baseSalary: currentSalary,
      bonus: currentBonus,
      effectiveDate: reviewDate,
      reason: SALARY_REASONS[Math.floor(Math.random() * SALARY_REASONS.length)],
    });
  }

  return history;
}

// ── Main seed function ────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed — 10,000 employees...");
  const startTime = Date.now();

  // Clear existing data
  await prisma.salaryRecord.deleteMany();
  await prisma.employee.deleteMany();
  console.log("  ✓ Cleared existing data");

  const BATCH_SIZE = 500;
  const TOTAL = 10000;
  let created = 0;

  for (let batch = 0; batch < TOTAL / BATCH_SIZE; batch++) {
    const employees: Array<{
      id: string;
      employeeId: string;
      firstName: string;
      lastName: string;
      email: string;
      gender: string;
      department: string;
      position: string;
      country: string;
      currency: string;
      status: string;
      startDate: Date;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    const salaryRecords: Array<{
      id: string;
      employeeId: string;
      baseSalary: number;
      bonus: number;
      effectiveDate: Date;
      reason: string;
      createdAt: Date;
    }> = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const globalIndex = batch * BATCH_SIZE + i + 1;
      const countryConfig = pickWeighted(COUNTRY_CONFIG);
      const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const positions = POSITIONS_BY_DEPT[department];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const gender = Math.random() < 0.48 ? "Male" : Math.random() < 0.96 ? "Female" : "Other";
      const firstName =
        gender === "Male"
          ? faker.person.firstName("male")
          : faker.person.firstName("female");
      const lastName = faker.person.lastName();

      // Generate unique email
      const email = faker.internet
        .email({ firstName, lastName, provider: "acme.com" })
        .toLowerCase()
        .replace(/[^a-z0-9@._+-]/g, "")
        + `.${globalIndex}@acme.com`;

      const startDate = faker.date.between({
        from: new Date("2015-01-01"),
        to: new Date("2024-12-31"),
      });

      const status = Math.random() < 0.05 ? "Inactive" : "Active";

      const baseSalary = Math.round(
        faker.number.float({
          min: countryConfig.salaryMin,
          max: countryConfig.salaryMax,
        })
      );
      const bonus = Math.round(baseSalary * faker.number.float({ min: 0, max: 0.25 }));

      const empId = `emp_${globalIndex}_${faker.string.alphanumeric(6)}`;

      employees.push({
        id: empId,
        employeeId: generateEmployeeId(globalIndex),
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${globalIndex}@acme.com`,
        gender,
        department,
        position,
        country: countryConfig.country,
        currency: countryConfig.currency,
        status,
        startDate,
        createdAt: startDate,
        updatedAt: new Date(),
      });

      const history = generateSalaryHistory(baseSalary, bonus, startDate);
      for (const record of history) {
        salaryRecords.push({
          id: `sal_${globalIndex}_${faker.string.alphanumeric(8)}`,
          employeeId: empId,
          baseSalary: record.baseSalary,
          bonus: record.bonus,
          effectiveDate: record.effectiveDate,
          reason: record.reason,
          createdAt: record.effectiveDate,
        });
      }
    }

    // Insert batch
    await prisma.employee.createMany({ data: employees });
    await prisma.salaryRecord.createMany({ data: salaryRecords });

    created += employees.length;
    console.log(`  ✓ Batch ${batch + 1}/${TOTAL / BATCH_SIZE} — ${created.toLocaleString()} employees created`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Seed complete — ${created.toLocaleString()} employees in ${elapsed}s`);

  const stats = await prisma.employee.groupBy({
    by: ["country"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  console.log("\n📊 Top 5 countries:");
  for (const s of stats) {
    console.log(`  ${s.country}: ${s._count.id} employees`);
  }
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
