import { useMemo } from 'react';
import { useEventData } from '../contexts/EventDataContext';

export default function StatsPage() {
  const { events, members } = useEventData();

  const stats = useMemo(() => {
    const sportCounts = {};
    const dayCounts = {};
    const memberCounts = {};

    events.forEach((event) => {
      sportCounts[event.sport_type] = (sportCounts[event.sport_type] || 0) + event.rsvps.filter((r) => r.status === 'going').length;
      const day = new Date(event.start_at).toLocaleDateString(undefined, { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      event.rsvps.filter((r) => r.status === 'going').forEach((rsvp) => {
        const nickname = members.find((member) => member.id === rsvp.user_id)?.nickname || 'Player';
        memberCounts[nickname] = (memberCounts[nickname] || 0) + 1;
      });
    });

    return {
      topSports: Object.entries(sportCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topDays: Object.entries(dayCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topMembers: Object.entries(memberCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      averageTurnout: events.length ? (events.reduce((sum, event) => sum + event.rsvps.filter((r) => r.status === 'going').length, 0) / events.length).toFixed(1) : '0.0',
    };
  }, [events, members]);

  return (
    <div className="stack-lg">
      <section className="stats-strip">
        <div className="stat-card"><strong>{events.length}</strong><span>Upcoming events</span></div>
        <div className="stat-card"><strong>{stats.averageTurnout}</strong><span>Avg turnout</span></div>
        <div className="stat-card"><strong>{members.length}</strong><span>Total members</span></div>
      </section>

      <section className="panel">
        <h2>Club Stats</h2>
        <div className="stats-columns">
          <div>
            <h3>Most attended sports</h3>
            {stats.topSports.map(([label, value]) => <div key={label} className="row-line"><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          <div>
            <h3>Most active members</h3>
            {stats.topMembers.map(([label, value]) => <div key={label} className="row-line"><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          <div>
            <h3>Most popular days</h3>
            {stats.topDays.map(([label, value]) => <div key={label} className="row-line"><span>{label}</span><strong>{value}</strong></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
