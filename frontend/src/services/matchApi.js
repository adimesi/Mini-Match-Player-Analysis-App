import instance from "./api";

export const fetchMatches = async () => {
  try {
    const response = await instance.get('/matches');
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

export const getMatchDetails = async (matchId) => {
  try {
    const response = await instance.get(`/matches/${matchId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching match details:", error);
    throw error;
  }
};

