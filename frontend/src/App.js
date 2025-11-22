import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PlayerDetail from './pages/PlayerDetail.jsx';
import MatchDetail from './pages/MatchDetail.jsx';
import MatchList from './pages/Matchlist.jsx';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MatchList/>} />
          <Route path="/matches" element={<MatchList />} />
          <Route path="/matches/:matchId" element={<MatchDetail />} />
          <Route path="/players/:playerId" element={<PlayerDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
