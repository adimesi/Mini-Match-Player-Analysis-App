import { useEffect, useState } from 'react';
import { fetchMatches } from '../services/matchApi.js';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
import './MatchList.css'; 
import { useNavigate } from 'react-router-dom';

const MatchList = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        try {
            const data = await fetchMatches();
            const matchesArray = data.matches || [];
            const toISO = (dstr) => {
              if (!dstr) return '';
              const parts = dstr.split('/').map(p => p.trim());
              if (parts.length !== 3) return dstr;
              const [day, month, year] = parts;
              const mm = month.padStart ? month.padStart(2, '0') : ('0' + month).slice(-2);
              const dd = day.padStart ? day.padStart(2, '0') : ('0' + day).slice(-2);
              return `${year}-${mm}-${dd}`;
            };

            const withKeys = matchesArray.map(m => ({ ...m, _dateKey: toISO(m.date) }));

            // Sort by ISO date ascending
            const sortedMatches = withKeys.sort((a, b) => {
                if (!a._dateKey || !b._dateKey) return 0;
                return a._dateKey.localeCompare(b._dateKey);
            });

            setMatches(sortedMatches);

            // Extract unique ISO dates in order
            const dates = Array.from(new Set(sortedMatches.map(m => m._dateKey))).filter(Boolean);
            setUniqueDates(dates);

            // Default selected date: prefer today if present, else the first future date, else the last available
            const todayIso = new Date().toISOString().slice(0,10);
            let defaultIndex = dates.indexOf(todayIso);
            if (defaultIndex === -1) {
              // find first date >= today
              defaultIndex = dates.findIndex(d => d >= todayIso);
            }
            if (defaultIndex === -1) defaultIndex = dates.length ? dates.length - 1 : -1;
            setSelectedDateIndex(defaultIndex);
        } catch (err) {
            console.error(err);
            setError("Failed to load matches.");
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, []);

  // Helper for logos
  const getLogo = (url, name) => 
    url !== "-1" ? url : `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&rounded=true`;

  // Format a date string to a nicer display.
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    let d;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return dateStr;
      const [day, month, year] = parts.map(p => parseInt(p, 10));
      d = new Date(year, month - 1, day);
    } else if (dateStr.includes('-')) {
      // ISO YYYY-MM-DD
      d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d)) return dateStr;
    } else {
      d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
    }
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const prevDay = () => {
    setSelectedDateIndex(i => Math.max(0, i - 1));
  };

  const nextDay = () => {
    setSelectedDateIndex(i => Math.min(uniqueDates.length - 1, i + 1));
  };

  if (loading) return <div className="loading-state">Loading schedule...</div>;
  if (error) return <div className="error-state">{error}</div>;
  // Determine which matches to show (group by selected date)
  const matchesForSelected = (uniqueDates.length && selectedDateIndex >= 0)
    ? matches.filter(m => m._dateKey === uniqueDates[selectedDateIndex])
    : matches;

  return (
    <div className="match-list-container">
      <div className="match-header">
        <button className="nav-btn" onClick={prevDay} disabled={selectedDateIndex <= 0} aria-label="Previous day">
          <ChevronLeft size={20} />
        </button>
        <span className="header-title">{uniqueDates.length ? formatDisplayDate(uniqueDates[selectedDateIndex]) : 'Matches'}</span>
        <button className="nav-btn" onClick={nextDay} disabled={selectedDateIndex >= uniqueDates.length - 1} aria-label="Next day">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="match-table">
        {matchesForSelected.map((match) => (
          <div key={match.game_id} className="match-row">
            {/* Column 1: Date */}
            <div className="date-column">
              <span className="match-date">{formatDisplayDate(match._dateKey || match.date)}</span> 
              <span className="match-time">{match.hour}</span>
            </div>
            {/* Column 2: Matchup */}
            <div className="matchup-column">
              {/* Home */}
              <div className="team-cell home">
                <span className="team-name">
                    {match.team_a_name_en || match.team_a_name}
                </span>
                <img 
                    src={getLogo(match.team_a_logo, match.team_a_name_en)} 
                    alt="Home" 
                    className="team-logo" 
                />
              </div>

              {/* Score */}
              <div className="score-badge">
                {match.result || "VS"}
              </div>

              {/* Away */}
              <div className="team-cell away">
                <img 
                    src={getLogo(match.team_b_logo, match.team_b_name_en)} 
                    alt="Away" 
                    className="team-logo" 
                />
                <span className="team-name">
                    {match.team_b_name_en || match.team_b_name}
                </span>
              </div>
            </div>

            {/* Column 3: Stadium */}
            <div className="stadium-column">
                {match.stadium_name_en || match.stadium_name}
            </div>

            {/* Column 4: Actions */}
            <div className="actions-column">
                <button 
                    className="details-btn" 
                    onClick={() => navigate(`/matches/${match.game_id}`)}
                >
                    Details
                </button>
                
                {match.pxlt_game_id && (
                    <Video size={20} className="video-icon" title="Watch Video" />
                )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchList;