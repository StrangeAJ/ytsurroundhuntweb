const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const port = process.env.PORT || 10000;

const surround_formats = ['256', '258', '325', '327', '328', '338', '380'];
let vids = [];

async function fetchInvidiousInstances() {
    try {
        const response = await axios.get('https://api.invidious.io/instances.json?sort_by=type,health');
        return response.data.map(instance => instance[1].uri);
    } catch (error) {
        console.error('Error fetching Invidious instances:', error);
        return [];
    }
}

async function searchYouTube(query, invidiousUrl) {
    let availableFormats = [];
    let vidIdswithSurroundSound = [];
    const url = `${invidiousUrl}/api/v1/search?type=video&q=${query}`;
    try {
        const response = await axios.get(url);
        vids = response.data;
        for (const video of vids) {
            const videoId = video.videoId;
            const videoUrl = `${invidiousUrl}/api/v1/videos/${videoId}`;
            const videoResponse = await axios.get(videoUrl, {
                headers: {
                    'Host': invidiousUrl.split('//')[1],
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
                    url: invidiousUrl + '/watch?v=' + videoId
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
    return { availableFormats };
}


app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const instances = await fetchInvidiousInstances();
    res.render('index', { results: null, instances });
});

app.post('/', async (req, res) => {
    if (!req.body.query || !req.body.invidious_url) {
        return res.send("Please enter a valid search term and select an Invidious URL.");
    }

    try {
        const { availableFormats } = await searchYouTube(req.body.query, req.body.invidious_url);
        const instances = await fetchInvidiousInstances();
        res.render('index', { results: availableFormats, instances });
    } catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
