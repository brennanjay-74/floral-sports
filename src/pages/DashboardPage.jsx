import { isToday, isThisWeek } from '../utils/date';
import EventCard from '../components/EventCard';
import { useEventData } from '../contexts/EventDataContext';

export default function DashboardPage() {
  const { events, loading, setSelectedEvent, updateRsvp, members } = useEventData();

  const upcoming = events[0];
  const todayEvents = events.filter((event) => isToday(event.start_at));
  const weekEvents = events.filter((event) => isThisWeek(event.start_at));
  const recurring = events.filter((event) => event.is_recurring).slice(0, 4);

  const attendanceSummary = events.reduce(
    (acc, event) => {
      acc.going += event.rsvps.filter((r) => r.status === 'going').length;
      acc.maybe += event.rsvps.filter((r) => r.status === 'maybe').length;
      acc.notGoing += event.rsvps.filter((r) => r.status === 'not_going').length;
      return acc;
    },
    { going: 0, maybe: 0, notGoing: 0 },
  );

  if (loading) return <div className="screen-center">Loading events…</div>;

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Next run up</p>
          <h2>{upcoming ? upcoming.title : 'No upcoming event yet'}</h2>
          <p className="muted">{upcoming ? `${upcoming.sport_type} • ${upcoming.location}` : 'Create the first sport night.'}</p>
        </div>
        {upcoming && (
          <button className="primary-button" onClick={() => setSelectedEvent(upcoming.id)}>
            Open Event
          </button>
        )}
      </section>

      <section className="stats-strip">
        <div className="stat-card"><strong>{todayEvents.length}</strong><span>Today</span></div>
        <div className="stat-card"><strong>{weekEvents.length}</strong><span>This Week</span></div>
        <div className="stat-card"><strong>{attendanceSummary.going}</strong><span>Going</span></div>
        <div className="stat-card"><strong>{members.length}</strong><span>Members</span></div>
      </section>

      <section className="panel">
        <div className="section-header"><h3>Today</h3></div>
        <div className="stack-md">
          {todayEvents.length === 0 && <p className="muted">Nothing today.</p>}
          {todayEvents.map((event) => (
            <EventCard key={event.id} event={event} onOpen={setSelectedEvent} onRsvp={updateRsvp} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-header"><h3>This Week</h3></div>
        <div className="stack-md">
          {weekEvents.map((event) => (
            <EventCard key={event.id} event={event} onOpen={setSelectedEvent} onRsvp={updateRsvp} />
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-header"><h3>Recurring Series</h3></div>
        <div className="stack-md">
          {recurring.length === 0 && <p className="muted">No recurring runs set up yet.</p>}
          {recurring.map((event) => (
            <EventCard key={event.id} event={event} onOpen={setSelectedEvent} onRsvp={updateRsvp} />
          ))}
        </div>
      </section>
    </div>
  );
}
