export const APPLICATION_STATUS = Object.freeze({
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
});

export const APPLICATION_STATUS_VALUES = Object.freeze(Object.values(APPLICATION_STATUS));
export const DEFAULT_APPLICATION_STATUS = APPLICATION_STATUS.APPLIED;
