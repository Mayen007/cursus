import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_VALUES,
} from "../../../../shared/applicationStatuses.js";

const STATUS_COLORS = {
  [APPLICATION_STATUS.APPLIED]: "border-slate",
  [APPLICATION_STATUS.INTERVIEW]: "border-score",
  [APPLICATION_STATUS.OFFER]: "border-match",
  [APPLICATION_STATUS.REJECTED]: "border-gap",
};

export const APPLICATION_STATUSES = APPLICATION_STATUS_VALUES.map((id) => ({
  id,
  label: id,
  color: STATUS_COLORS[id],
}));
