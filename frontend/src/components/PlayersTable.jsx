import { PlayCircle} from 'lucide-react';


const PlayersTable = ({ team, onSeek, onPlayerClick }) => {
    if (!team) return null;
    const players = team.players || [];
    const starters = players.filter(p => p.main === "1");
    const subs = players.filter(p => p.main === "0");
    const getPos = (p) => p.position || (p.goalkeeper === "1" ? "GK" : "");

    const renderRows = (players) => players.map(player => (
        <tr key={player.player_id} onClick={() => onPlayerClick(player.player_id)}>
            <td className="col-no">{player.shirt_number}</td>
            <td className="col-pos">{getPos(player)}</td>
            <td className="col-name font-medium">
                {player.player_name}
                {player.captain === "1" && <span className="text-yellow-500 ml-1">©</span>}
            </td>
            <td className="col-min">{player.main === '1' ? "90'" : ""}</td>
            <td className="col-events" onClick={(e) => e.stopPropagation()}>
                {Array.isArray(player.events) && player.events.length > 0 && (
                    <div className="player-events">
                        {player.events.map((ev, i) => {
                            const minuteDisplay = ev.minute != null ? `${ev.minute}'` : '—';
                            let icon = '';
                            if (ev.type === 'goal') icon = '⚽';
                            else if (ev.type === 'yellow') icon = '🟨';
                            else if (ev.type === 'red') icon = '🟥';
                            else if (ev.type === 'sub') icon = '⬇️';
                            const seconds = (ev.minute != null ? ev.minute : 0) * 60 + (ev.second || 0);
                            return (
                                <button key={i} className={`player-event-badge event-${ev.type}`} onClick={(e) => { e.stopPropagation(); onSeek(seconds); }} title={`${ev.type} ${minuteDisplay}`}>
                                    <span className="event-icon">{icon}</span>
                                    <span className="event-min">({minuteDisplay})</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </td>
            <td className="col-video">
                <button className="video-icon-btn" onClick={(e) => { e.stopPropagation(); onSeek(player.events && player.events[0] ? ((player.events[0].minute || 0) * 60 + (player.events[0].second || 0)) : ""); }}>
                    <PlayCircle size={18} />
                </button>
            </td>
        </tr>
    ));

    return (
        <div className="team-table-container">
            <div className="team-table-header">{team.team_name_english}</div>
            <table className="players-table">
                <thead>
                    <tr>
                        <th className="col-no">No.</th>
                        <th className="col-pos">Pos.</th>
                        <th className="col-name">Name</th>
                        <th className="col-min">Min.</th>
                        <th className="col-events">Events</th>
                        <th className="col-video"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colSpan="6" className="lineup-section-header">Starting XI</td></tr>
                    {renderRows(starters)}
                    <tr><td colSpan="6" className="lineup-section-header">Substitutes</td></tr>
                    {renderRows(subs)}
                </tbody>
            </table>
        </div>
    );
};
export default PlayersTable;