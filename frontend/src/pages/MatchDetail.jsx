import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMatchDetails  } from '../services/matchApi.js';
import ReactHlsPlayer from 'react-hls-player'; 
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import './MatchDetail.css';
import breakdown_game_1061429_league_726 from '../data/breakdown_game_1061429_league_726.json';
import PlayersTable from '../components/PlayersTable.jsx';


const MatchDetails = () => {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const playerRef = useRef(null);

    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('matchSheet');
    const [videoType, setVideoType] = useState('hd');

    const [videoUrlHD, setVideoUrlHD] = useState('');
    const [videoUrlPano, setVideoUrlPano] = useState('');
    const [eventsList, setEventsList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const data = await getMatchDetails(matchId);
            setMatchData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };
        fetchData();
    }, [matchId]);

    useEffect(() => {
        setVideoUrlHD(matchData?.match_details?.video?.normal_hls || '');
        setVideoUrlPano(matchData?.match_details?.video?.pano_hls || '');
    }, [matchData]);


    // Parse events from the provided breakdown JSON file
    useEffect(() => {
        try {
            const events = [];

            const pushPlayerEvents = (playerObj, side) => {
                const fullName = `${playerObj.fname || ''} ${playerObj.lname || ''}`.trim();
                const number = playerObj.number || playerObj.team_number || '';
                const ev = playerObj.events || {};

                if (ev.goals && Array.isArray(ev.goals)) {
                    ev.goals.forEach((g) => {
                        events.push({
                            type: 'goal',
                            minute: g.start_minute || null,
                            second: g.start_second || 0,
                            playerName: fullName,
                            playerNumber: number,
                            playerId: playerObj.player_id,
                            side,
                        });
                    });
                }
                if (ev.yellows && Array.isArray(ev.yellows)) {
                    ev.yellows.forEach((y) => {
                        events.push({
                            type: 'yellow',
                            minute: y.start_minute || null,
                            second: y.start_second || 0,
                            playerName: fullName,
                            playerNumber: number,
                            playerId: playerObj.player_id,
                            side,
                        });
                    });
                }
                if (ev.reds && Array.isArray(ev.reds)) {
                    ev.reds.forEach((r) => {
                        events.push({
                            type: 'red',
                            minute: r.start_minute || null,
                            second: r.start_second || 0,
                            playerName: fullName,
                            playerNumber: number,
                            playerId: playerObj.player_id,
                            side,
                        });
                    });
                }
            };

            if (breakdown_game_1061429_league_726) {
                const b = breakdown_game_1061429_league_726;
                (b.home_team_players || []).forEach((p) => pushPlayerEvents(p, 'home'));
                (b.away_team_players || []).forEach((p) => pushPlayerEvents(p, 'away'));
            }

            // sort by minute then second (null minutes push to end)
            events.sort((a, b) => {
                const ma = a.minute == null ? 1e9 : a.minute;
                const mb = b.minute == null ? 1e9 : b.minute;
                if (ma !== mb) return ma - mb;
                return (a.second || 0) - (b.second || 0);
            });

            setEventsList(events);
        } catch (err) {
            console.error('Error parsing breakdown events', err);
        }
    }, []);

    const handleSeek = (minuteString) => {
        if (!playerRef.current) return;
        if (!minuteString && minuteString !== 0) return;
        let seconds = 0;
        if (typeof minuteString === 'number') {
            seconds = minuteString;
        } else {
            const minute = parseInt(minuteString.toString().replace(/\D/g, ''));
            if (Number.isFinite(minute)) seconds = minute * 60;
        }
        playerRef.current.currentTime = seconds;
        playerRef.current.play();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const seekToSeconds = (sec) => {
        if (!playerRef.current) return;
        const seconds = Number(sec) || 0;
        playerRef.current.currentTime = seconds;
        playerRef.current.play();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!matchData || !matchData.match_details) return <div className="p-8 text-center">Match not found</div>;


    const getLogo = (url, name) => {
        if (url && url !== "-1") return url;
        const safeName = name ? encodeURIComponent(name) : 'Team';
        return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff&rounded=true`;
    };


    const { match_details, teams } = matchData;
    const apiHome = teams?.[0] || {};
    const apiAway = teams?.[1] || {};

    // Build team objects for the UI by preferring players from the local breakdown JSON
    const buildTeamFromBreakdown = (playersArr = [], apiTeam = {}) => {
        const players = (playersArr || []).map((p, idx) => {
            const playerId = p.player_id || p.id || p.playerId || `p_${idx}`;
            const shirt = p.number || p.team_number || p.shirt_number || '';
            const name = [p.fname, p.lname].filter(Boolean).join(' ') || p.player_name || p.name || '';
            const position = p.position || p.role || (p.goalkeeper === '1' ? 'GK' : '') || '';
            const captain = p.captain === '1' || p.is_captain === true ? '1' : '0';

            // normalize events for this player
            const ev = p.events || {};
            const events = [];
            if (ev.goals && Array.isArray(ev.goals)) {
                ev.goals.forEach(g => events.push({ type: 'goal', minute: g.start_minute ?? null, second: g.start_second ?? 0 }));
            }
            if (ev.yellows && Array.isArray(ev.yellows)) {
                ev.yellows.forEach(y => events.push({ type: 'yellow', minute: y.start_minute ?? null, second: y.start_second ?? 0 }));
            }
            if (ev.reds && Array.isArray(ev.reds)) {
                ev.reds.forEach(r => events.push({ type: 'red', minute: r.start_minute ?? null, second: r.start_second ?? 0 }));
            }
            if (ev.subs && Array.isArray(ev.subs)) {
                ev.subs.forEach(s => {
                    // subs might have sub_type or side info; treat as 'sub' with minute
                    events.push({ type: 'sub', minute: s.start_minute ?? null, second: s.start_second ?? 0 });
                });
            }

            // sort player events by minute
            events.sort((a, b) => {
                const ma = a.minute == null ? 1e9 : a.minute;
                const mb = b.minute == null ? 1e9 : b.minute;
                if (ma !== mb) return ma - mb;
                return (a.second || 0) - (b.second || 0);
            });

            return {
                player_id: playerId,
                shirt_number: shirt,
                player_name: name,
                position,
                main: idx < 11 ? '1' : '0',
                captain,
                events,
            };
        });

        return {
            ...apiTeam,
            team_name_english: apiTeam?.team_name_english || apiTeam?.team_name || apiTeam?.name || apiTeam?.short_name || '',
            players,
        };
    };

    const homeTeam = buildTeamFromBreakdown(breakdown_game_1061429_league_726?.home_team_players || [], apiHome);
    const awayTeam = buildTeamFromBreakdown(breakdown_game_1061429_league_726?.away_team_players || [], apiAway);

  return (
    <div className="match-details-container">
      {/* Header */}
      <div className="match-details-header">
          <span>Match Details</span>
          <button onClick={() => navigate(-1)} className="close-button"><X size={24} /></button>
      </div>

      <div className="match-details-content">
        
        {/* Info Bar */}
        <div className="match-info-sub">
            <div className="info-item"><Calendar size={16} /> {new Date(match_details.time).toLocaleDateString('en-GB')}</div>
            <div className="info-item"><Clock size={16} /> {match_details.hr}</div>
            <div className="info-item"><MapPin size={16} /> Venue</div>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
            <div className="team-info">
                <img src={getLogo(homeTeam?.team_logo || "-1", homeTeam?.team_name_english)} className="team-logo-large" alt="home team" />
                <div className="team-name">{homeTeam?.team_name_english}</div>
            </div>
            <div className="score-box">{homeTeam?.goals}-{awayTeam?.goals}</div>
            <div className="team-info">
                <img src={getLogo(awayTeam?.team_logo || "-1", awayTeam?.team_name_english)} className="team-logo-large" alt="away team" />
                <div className="team-name">{awayTeam?.team_name_english}</div>
            </div>
        </div>

        {/* --- VIDEO SECTION --- */}
          <div className="video-section-container">
            <div className="video-toggles">
                <button className={`toggle-btn ${videoType === 'hd' ? 'active' : ''}`} onClick={() => setVideoType('hd')}>HD</button>
                <button className={`toggle-btn ${videoType === 'pano' ? 'active' : ''}`} onClick={() => setVideoType('pano')}>Pano</button>
            </div>

            <div className="video-wrapper">
                {(videoType === 'hd' ? videoUrlHD : videoUrlPano) ? (
                    <ReactHlsPlayer
                        key={`${videoType}-${videoType === 'hd' ? videoUrlHD : videoUrlPano}`}
                        playerRef={playerRef}
                        src={videoType === 'hd' ? videoUrlHD : videoUrlPano}
                        autoPlay
                        controls
                        width="100%"
                        height="100%"
                        playsInline
                    />
                ) : (
                    <div className="no-video-placeholder">No video available</div>
                )}
            </div>
          </div>
        {/* Tabs */}
        <div className="tabs-nav">
            <button className={`tab-btn ${activeTab === 'matchSheet' ? 'active' : ''}`} onClick={() => setActiveTab('matchSheet')}>Match Sheet</button>
            <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Events</button>
        </div>

        {/* Content */}
        {activeTab === 'matchSheet' && (
           <div className="match-sheet-container">
              <PlayersTable team={homeTeam} onSeek={handleSeek} onPlayerClick={(id) => navigate(`/players/${id}`)} />
              <PlayersTable team={awayTeam} onSeek={handleSeek} onPlayerClick={(id) => navigate(`/players/${id}`)} />
           </div>
        )}
        {activeTab === 'events' && (
            <div className="events-container">
                    {eventsList.length === 0 ? (
                        <div className="p-4">No events found</div>
                    ) : (
                        <div className="events-layout">
                            <div className="events-timeline-column">
                                <div className="events-timeline">
                                    {eventsList.map((e, idx) => {
                                        const minute = e.minute != null ? e.minute : null;
                                        const second = e.second || 0;
                                        const displayTime = minute != null ? `${minute}:${String(second).padStart(2, '0')}` : '—';
                                        const secondsForSeek = (minute != null ? minute : 0) * 60 + (second || 0);
                                        const sideClass = e.side === 'home' ? 'left' : 'right';
                                            return (
                                            <div key={idx} className={`timeline-item ${sideClass}`} onClick={() => { seekToSeconds(secondsForSeek); }}>
                                                <div className="timeline-marker">{minute != null ? minute : ''}</div>
                                                <div className={`timeline-content`}>
                                                    <div className="event-detail">{e.type.toUpperCase()}</div>
                                                    <div className="event-player">{e.playerName} <span className="player-number">#{e.playerNumber}</span></div>
                                                    <div className="seek-icon">{displayTime}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        )}
      </div>
    </div>
  );
};



export default MatchDetails;
