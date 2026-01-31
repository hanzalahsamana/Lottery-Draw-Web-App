export function generateTimestamp() {
  const d = new Date();

  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0'); // 01–12
  const DD = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

export function gmt8ToLocal(timeStr) {
  // Get local timezone offset in hours
  const localOffset = new Date().getTimezoneOffset() / -60;

  let iso;
  if (localOffset === 5) {
    // For Pakistan, treat input as GMT+8
    iso = timeStr.replace(' ', 'T') + '+08:00';
  } else {
    // For everyone else, parse as-is (local time)
    iso = timeStr.replace(' ', 'T');
  }

  const date = new Date(iso);
  return date;
}

export function formatDaysHoursMinutesSeconds(sec) {
  const days = Math.floor(sec / 86400);
  sec %= 86400;
  const hours = Math.floor(sec / 3600);
  sec %= 3600;
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatYYYYMMDD(dateStr) {
  if (!dateStr || dateStr.length !== 8) return '';

  const date = new Date(dateStr.slice(0, 4), dateStr.slice(4, 6) - 1, dateStr.slice(6, 8));

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
