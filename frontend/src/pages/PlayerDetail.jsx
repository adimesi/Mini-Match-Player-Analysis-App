import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import breakdown from '../data/breakdown_game_1061429_league_726.json';
import './PlayerDetail.css';
import RadarChart from '../components/RadarChart';

const PlayerDetail = () => {
    const { playerId } = useParams();
    const navigate = useNavigate();

    const { player, teamName } = useMemo(() => {
        if (!breakdown) return { player: null, teamName: '' };
        const home = breakdown.home_team_players || [];
        const away = breakdown.away_team_players || [];
        let found = home.find(p => String(p.player_id) === String(playerId) || String(p.id) === String(playerId));
        if (found) return { player: found, teamName: breakdown.home_label || '' };
        found = away.find(p => String(p.player_id) === String(playerId) || String(p.id) === String(playerId));
        if (found) return { player: found, teamName: breakdown.away_label || '' };
        return { player: null, teamName: '' };
    }, [playerId]);
    //try to read from player.skills or fallback to mocked values
    const skills = useMemo(() => {
        const fromData = (player && (player.skills || player.attributes)) || null;
        if (fromData) {
        return {
            Passing: fromData.passing ?? fromData.Pass ?? fromData.p ?? 60,
            Dribbling: fromData.dribbling ?? fromData.Dribble ?? fromData.d ?? 60,
            Speed: fromData.speed ?? fromData.Spd ?? fromData.s ?? 60,
            Strength: fromData.strength ?? fromData.Str ?? fromData.str ?? 60,
            Vision: fromData.vision ?? fromData.Vision ?? 60,
            Defending: fromData.defending ?? fromData.Def ?? fromData.def ?? 60,
        };
        }
        return {
        Passing: 68,
        Dribbling: 72,
        Speed: 75,
        Strength: 60,
        Vision: 70,
        Defending: 55,
        };
    }, [player]);

  const labels = Object.keys(skills);
  const values = Object.values(skills);

  const playerEvents = useMemo(() => {
    if (!breakdown || !player) return [];
    const events = [];
    const collect = (list, side) => {
      (list || []).forEach(p => {
        if (String(p.player_id) === String(player.player_id) || String(p.id) === String(player.player_id)) {
          const ev = p.events || {};
          if (ev.goals) ev.goals.forEach(g => events.push({ type: 'goal', minute: g.start_minute ?? null, second: g.start_second ?? 0, side }));
          if (ev.yellows) ev.yellows.forEach(y => events.push({ type: 'yellow', minute: y.start_minute ?? null, second: y.start_second ?? 0, side }));
          if (ev.reds) ev.reds.forEach(r => events.push({ type: 'red', minute: r.start_minute ?? null, second: r.start_second ?? 0, side }));
        }
      });
    };
    collect(breakdown.home_team_players || [], 'home');
    collect(breakdown.away_team_players || [], 'away');
    events.sort((a,b) => (a.minute==null?1e9:a.minute) - (b.minute==null?1e9:b.minute) || (a.second||0)-(b.second||0));
    return events;
  }, [player]);

  
  const name = player ? ([player.fname, player.lname].filter(Boolean).join(' ') || player.player_name || player.name || 'Unknown') : 'Unknown';
  const position = player ? (player.position || player.role || (player.goalkeeper === '1' ? 'GK' : '') || '') : '';
  const dob = player ? (player.dob || player.birth_date || null) : null;

  const matchRow = useMemo(() => {
    if (!breakdown) return null;
    const goals = playerEvents.filter(e => e.type === 'goal').length;
    const yc = playerEvents.filter(e => e.type === 'yellow').length;
    const rc = playerEvents.filter(e => e.type === 'red').length;
    return {
      date: breakdown.match_date || '',
      match: `${breakdown.home_label || 'Home'} - ${breakdown.away_label || 'Away'}`,
      score: `${breakdown.home_team_score ?? '-'}:${breakdown.away_team_score ?? '-'}`,
      position: position || '',
      yc,
      rc,
      goals,
    };
  }, [playerEvents, position]);

  if (!player) {
    return (
      <div className="player-detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <div className="not-found">Player not found</div>
      </div>
    );
  }

  return (
    <div className="player-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
      <div className="player-header">
        <div className="avatar">{name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
        <div className="player-basic">
          <h2 className="player-name">{name}</h2>
          <div className="player-meta">
            <div><strong>Position:</strong> {position || '—'}</div>
            <div><strong>Team:</strong> {teamName || '—'}</div>
            {dob && <div><strong>DOB:</strong> {dob}</div>}
          </div>
        </div>
      </div>

      <div className="player-charts">
        <div className="radar-card">
          <h3>Skill Radar</h3>
          <RadarChart labels={labels} values={values} size={320} maxValue={100} />
        </div>
        <div className="matches-card">
          <h3>Matches</h3>
          <table className="matches-table">
            <thead>
              <tr><th>Date</th><th>Match</th><th>Score</th><th>Position</th><th>YC</th><th>RC</th><th>Goal</th></tr>
            </thead>
            <tbody>
              {matchRow ? (
                <tr>
                  <td>{matchRow.date}</td>
                  <td>{matchRow.match}</td>
                  <td>{matchRow.score}</td>
                  <td>{matchRow.position || '-'}</td>
                  <td>{matchRow.yc || '-'}</td>
                  <td>{matchRow.rc || '-'}</td>
                  <td>{matchRow.goals || '-'}</td>
                </tr>
              ) : (
                <tr><td colSpan={7}>No match data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
