const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false,
});

async function getRandomQuote(amount = 1) {
    try {
        const QUOTES_API = process.env.QUOTES_API;
        const response = await axios.get(`${QUOTES_API}/quotes/random?limit=${amount}`, {
            httpsAgent: agent,
        });
        const quotes = response.data.map(quote => quote.content);
        return quotes;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching random quote');
    }
}

module.exports = { getRandomQuote };