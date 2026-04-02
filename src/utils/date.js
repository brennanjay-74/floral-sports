import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  set,
  startOfDay,
  startOfWeek,
} from 'date-fns';

export function formatEventDate(dateString) {
  return format(parseISO(dateString), 'EEE, MMM d');
}

export function formatEventTime(dateString) {
  return format(parseISO(dateString), 'h:mm a');
}

export function formatDateTimeRange(startAt, endAt) {
  return `${format(parseISO(startAt), 'EEE, MMM d • h:mm a')} – ${format(parseISO(endAt), 'h:mm a')}`;
}

export function getWeekRange(date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function isThisWeek(dateString) {
  const date = parseISO(dateString);
  const { start, end } = getWeekRange(new Date());
  return !isBefore(date, startOfDay(start)) && !isAfter(date, endOfDay(end));
}

export function isToday(dateString) {
  return isSameDay(parseISO(dateString), new Date());
}

export function buildOccurrences(series, horizonDays = 90) {
  const occurrences = [];
  if (!series?.recurrence_rule?.type || series.recurrence_rule.type === 'none') return occurrences;

  const rule = series.recurrence_rule;
  const startBase = parseISO(series.start_at);
  const until = rule.until ? parseISO(rule.until) : addDays(new Date(), horizonDays);
  let cursor = startBase;

  while (!isAfter(cursor, until) && occurrences.length < 120) {
    const day = cursor.getDay();
    const byWeekday = rule.byWeekday ?? [day];

    if (rule.type === 'weekly') {
      byWeekday.forEach((weekday) => {
        const baseWeekStart = startOfWeek(cursor, { weekStartsOn: 0 });
        const candidate = addDays(baseWeekStart, weekday);
        const startAt = set(candidate, {
          hours: startBase.getHours(),
          minutes: startBase.getMinutes(),
          seconds: 0,
          milliseconds: 0,
        });
        const endAt = new Date(startAt.getTime() + rule.durationMinutes * 60000);
        if (!isBefore(startAt, startBase) && !isAfter(startAt, until)) {
          occurrences.push({ startAt: startAt.toISOString(), endAt: endAt.toISOString() });
        }
      });
      cursor = addWeeks(cursor, rule.interval || 1);
    } else if (rule.type === 'monthly') {
      const monthCursor = cursor;
      const occurrenceDay = rule.byMonthDay || startBase.getDate();
      const startAt = set(monthCursor, {
        date: occurrenceDay,
        hours: startBase.getHours(),
        minutes: startBase.getMinutes(),
        seconds: 0,
        milliseconds: 0,
      });
      const endAt = new Date(startAt.getTime() + rule.durationMinutes * 60000);
      if (!isBefore(startAt, startBase) && !isAfter(startAt, until)) {
        occurrences.push({ startAt: startAt.toISOString(), endAt: endAt.toISOString() });
      }
      cursor = addMonths(cursor, rule.interval || 1);
    } else {
      break;
    }
  }

  return occurrences.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}
