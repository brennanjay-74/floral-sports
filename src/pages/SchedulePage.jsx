import { useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import { DAYS, SPORTS } from '../utils/constants';
import { useEventData } from '../contexts/EventDataContext';

export default function SchedulePage() {
  const { events, setSelectedEvent, updateRsvp } = useEventData();
  const [filters, setFilters] = useState({
    mineOnly: false,
    sport: 'All',
    day: 'All',
    series: 'all',
  });

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (filters.mineOnly && event.myRsvp !== 'going') return false;
      if (filters.sport !== 'All' && event.sport_type !== filters.sport) return false;
      if (filters.day !== 'All' && new Date(event.start_at).getDay() !== DAYS.indexOf(filters.day)) return false;
      if (filters.series === 'recurring' && !event.is_recurring) return false;
      if (filters.series === 'single' && event.is_recurring) return false;
      return true;
    });
  }, [events, filters]);

  return (
    <div className="stack-lg">
      <section className="panel">
        <h2>Schedule</h2>
        <div className="filter-grid">
          <label><span>Sport</span><select value={filters.sport} onChange={(e) => setFilters((f) => ({ ...f, sport: e.target.value }))}><option>All</option>{SPORTS.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
          <label><span>Day</span><select value={filters.day} onChange={(e) => setFilters((f) => ({ ...f, day: e.target.value }))}><option>All</option>{DAYS.map((day) => <option key={day}>{day}</option>)}</select></label>
          <label><span>Series</span><select value={filters.series} onChange={(e) => setFilters((f) => ({ ...f, series: e.target.value }))}><option value="all">All</option><option value="recurring">Recurring</option><option value="single">One-time</option></select></label>
          <label className="checkbox-row"><input type="checkbox" checked={filters.mineOnly} onChange={(e) => setFilters((f) => ({ ...f, mineOnly: e.target.checked }))} /> Only events I’m going to</label>
        </div>
      </section>

      <section className="stack-md">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} onOpen={setSelectedEvent} onRsvp={updateRsvp} />
        ))}
      </section>
    </div>
  );
}
