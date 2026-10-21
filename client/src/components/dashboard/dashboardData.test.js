import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardData } from "./dashboardData.js";

const TODAY = new Date(2026, 9, 12);

function createApplication(id, overrides = {}) {
  return {
    id,
    company: `Company ${id}`,
    jobTitle: "Developer",
    appliedDate: "2026-10-01",
    status: "Applied",
    followUpDate: "",
    ...overrides,
  };
}

test("counts total applications and each status", () => {
  const applications = [
    createApplication("1", { status: "Applied" }),
    createApplication("2", { status: "Interview" }),
    createApplication("3", { status: "Interview" }),
    createApplication("4", { status: "Offer" }),
  ];

  const dashboard = getDashboardData(applications, [], TODAY);

  assert.equal(dashboard.totalApplications, 4);
  assert.deepEqual(
    dashboard.statusCounts.map(({ id, count }) => [id, count]),
    [
      ["Applied", 1],
      ["Interview", 2],
      ["Offer", 1],
      ["Rejected", 0],
    ]
  );
});

test("shows overdue follow-ups first and includes dates through seven days", () => {
  const applications = [
    createApplication("due-in-seven", { followUpDate: "2026-10-19" }),
    createApplication("due-today", { followUpDate: "2026-10-12" }),
    createApplication("overdue", { followUpDate: "2026-10-10" }),
    createApplication("outside-window", { followUpDate: "2026-10-20" }),
    createApplication("closed", { followUpDate: "2026-10-11", status: "Offer" }),
  ];

  const dashboard = getDashboardData(applications, [], TODAY);

  assert.deepEqual(
    dashboard.followUps.map(({ id }) => id),
    ["overdue", "due-today", "due-in-seven"]
  );
  assert.equal(dashboard.overdueFollowUps, 1);
  assert.equal(dashboard.upcomingFollowUps, 2);
});

test("limits recent records to five in descending date order", () => {
  const applications = Array.from({ length: 7 }, (_, index) =>
    createApplication(String(index + 1), {
      appliedDate: `2026-10-${String(index + 1).padStart(2, "0")}`,
    })
  );
  const tailoredResumes = applications.map(({ id, appliedDate }) => ({
    id,
    createdAt: appliedDate,
  }));

  const dashboard = getDashboardData(applications, tailoredResumes, TODAY);

  assert.deepEqual(
    dashboard.recentApplications.map(({ id }) => id),
    ["7", "6", "5", "4", "3"]
  );
  assert.deepEqual(
    dashboard.recentTailoredResumes.map(({ id }) => id),
    ["7", "6", "5", "4", "3"]
  );
});
