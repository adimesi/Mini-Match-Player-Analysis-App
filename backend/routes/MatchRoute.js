const axios=require('axios');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv'); 
dotenv.config();

const USER_TOKEN = process.env.USER_TOKEN;



const EASYCOACH_MATCHES_API_URL = process.env.EASYCOACH_MATCHES_API_URL;
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${EASYCOACH_MATCHES_API_URL}`);
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches in api:' +EASYCOACH_MATCHES_API_URL  });
    }
});

const API_BASE_URL = process.env.API_BASE_URL;
router.get('/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const response = await axios.get(`${API_BASE_URL}/analytics/match`, {
            params: {
                match_id: matchId,
                user_token: USER_TOKEN
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch match details' });
    }
});



module.exports = router;
