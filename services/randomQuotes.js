const axios = require('axios');
const https = require('https');

async function getRandomQuote() {
    try {
        const QUOTES_API = process.env.QUOTES_API;
        const response = await axios.get(`${QUOTES_API}/random`);
        const quotes = response.data.quote.content;
        return quotes;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching random quote');
    }
}

async function getMultipleRandomQuotes(amount = 1) {
    try {
        const QUOTES_API = process.env.QUOTES_API;
        const response = await axios.get(`${QUOTES_API}?limit=${amount}`);
        const quotes = response.data.data.map(quote => quote.content);
        return quotes;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching random quote');
    }
}

module.exports = { getRandomQuote, getMultipleRandomQuotes };