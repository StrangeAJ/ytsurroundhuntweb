const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const port = process.env.PORT || 10000;
const INVIDIOUS_URL = process.env.INVIDIOUS_URL;

const surround_formats = ['256', '258', '325', '327', '328', '338', '380'];
let vids = [];

async function searchYouTube(query) {
    let availableFormats = [];
    let vidIdswithSurroundSound = [];
    const url = `${INVIDIOUS_URL}/api/v1/search?type=video&q=${query}`;
    try {
        const response = await axios.get(url);
        vids = response.data;
        for (const video of vids) {
            const videoId = video.videoId;
            const videoUrl = `${INVIDIOUS_URL}/api/v1/videos/${videoId}`;
            const videoResponse = await axios.get(videoUrl, {
                headers: {
                    'Host': INVIDIOUS_URL.split('//')[1],
                    'Cookie': 'INVIDIOUS_SERVER_ID=2'
                }
            });
            const videoData = videoResponse.data;
            const formats = videoData.adaptiveFormats;
            const availableSurroundFormats = formats.filter((format) => {
                return surround_formats.includes(format.itag);
            });
            if (availableSurroundFormats.length > 0) {
                vidIdswithSurroundSound.push(videoId);
                const itags = availableSurroundFormats.map(format => format.itag);
                availableFormats.push({
                    id: videoId,
                    formats : itags,
                    title: videoData.title,
                    url: 'https://inv.nadeko.net/watch?v=' + videoId
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
    return { availableFormats };
}

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { results: null });
});

app.post('/', async (req, res) => {
    if (!req.body.query) {
        return res.send("Please enter a valid url or keyword");
    }

    try {
        const { availableFormats } = await searchYouTube(req.body.query);
        // const responseForUI to be set according to availableFormats
        console.log(availableFormats);
        res.render('index', { results: availableFormats });
    } catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});