import { useEventData } from '../contexts/EventDataContext';

export default function MembersPage() {
  const { members, events } = useEventData();

  const memberStats = members.map((member) => {
    const attendance = events.flatMap((event) => event.rsvps).filter((rsvp) => rsvp.user_id === member.id && rsvp.status === 'going').length;
    return { ...member, attendance };
  });

  return (
    <div className="stack-lg">
      <section className="panel">
        <h2>Members</h2>
        <p className="muted">Make the app feel like the club, not just the calendar.</p>
      </section>

      <section className="member-grid">
        {memberStats.map((member) => (
          <article key={member.id} className="member-card">
            <div className="member-avatar">{member.avatar_icon || '🙂'}</div>
            <h3>{member.nickname}</h3>
            <p className="muted">{member.first_name} {member.last_name}</p>
            <div className="pill-stack left">
              {member.favorite_sport && <span className="pill">{member.favorite_sport}</span>}
              <span className="pill pill-green">{member.attendance} going</span>
              {member.created_at && (new Date() - new Date(member.created_at)) / 86400000 < 14 && <span className="pill">New</span>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
