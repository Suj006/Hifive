export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Longest valid day for each month, allowing Feb 29 since no year is stored.
export const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function formatBirthday(month: number, day: number): string {
  return `${day} ${MONTH_NAMES[month - 1]}`;
}
