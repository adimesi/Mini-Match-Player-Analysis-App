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

    if (!player) {
        return (
        <div className="player-detail-container">
            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
            <div className="not-found">Player not found</div>
        </div>
        );
    }

  const name = [player.fname, player.lname].filter(Boolean).join(' ') || player.player_name || player.name || 'Unknown';
  const position = player.position || player.role || (player.goalkeeper === '1' ? 'GK' : '') || '';
  const dob = player.dob || player.birth_date || null;

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
        <div className="radar-card">
          <h3>Notes</h3>
          <p className="muted">Values shown are taken from local data when available, otherwise mocked defaults are used.</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;