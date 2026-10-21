import { APPLICATION_STATUSES } from "../applications/applicationsData.js";

const DAYS_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const FOLLOW_UP_WINDOW_DAYS = 7;
const CLOSED_STATUSES = new Set(["Offer", "Rejected"]);
const RECENT_ITEM_LIMIT = 5;

function getLocalDayTimestamp(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateTimestamp(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getRecentItems(items, dateField) {
  return [...items]
    .sort((first, second) => second[dateField].localeCompare(first[dateField]))
    .slice(0, RECENT_ITEM_LIMIT);
}

function getFollowUps(applications, today) {
  const todayTimestamp = getLocalDayTimestamp(today);

  return applications
    .filter(({ followUpDate, status }) => followUpDate && !CLOSED_STATUSES.has(status))
    .map((application) => ({
      ...application,
      daysUntilFollowUp: Math.round(
        (getDateTimestamp(application.followUpDate) - todayTimestamp) / DAYS_IN_MILLISECONDS
      ),
    }))
    .filter(({ daysUntilFollowUp }) => daysUntilFollowUp <= FOLLOW_UP_WINDOW_DAYS)
    .sort(
      (first, second) =>
        first.daysUntilFollowUp - second.daysUntilFollowUp ||
        first.company.localeCompare(second.company)
    );
}

export function getDashboardData(applications, tailoredResumes, today = new Date()) {
  const statusCounts = APPLICATION_STATUSES.map(({ id, label }) => ({
    id,
    label,
    count: applications.filter(({ status }) => status === id).length,
  }));
  const followUps = getFollowUps(applications, today);

  return {
    totalApplications: applications.length,
    statusCounts,
    followUps,
    overdueFollowUps: followUps.filter(({ daysUntilFollowUp }) => daysUntilFollowUp < 0).length,
    upcomingFollowUps: followUps.filter(({ daysUntilFollowUp }) => daysUntilFollowUp >= 0).length,
    recentApplications: getRecentItems(applications, "appliedDate"),
    recentTailoredResumes: getRecentItems(tailoredResumes, "createdAt"),
  };
}
