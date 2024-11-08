const express = require('express');
const path = require('path');
const ytdl = require("@distube/ytdl-core");
const yts = require('yt-search');
// cors
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 4000;


async function getSurroundingAudios(vidIds) {
    let vidIdswithSurroundSound = [];
    let availableFormats = {};

    for (const vidId of vidIds) {
        try {
            const info = await ytdl.getInfo(vidId);
            const formats = info.player_response.streamingData.adaptiveFormats.filter(format => format.audioChannels === 6);
            if(formats.length > 0) {
                vidIdswithSurroundSound.push(vidId);
                const itags = formats.map(format => format.itag);
                availableFormats[vidId] = itags;
            }
        } catch (err) {
            console.log(err);
        }
    }

    return { vidIdswithSurroundSound, availableFormats };
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
        const results = await yts({
            query: req.body.query,
            pages: 2,
            search: "video",
        });
        const vids = results.videos;
        const vidIds = vids.map(vid => vid.videoId);
        const { vidIdswithSurroundSound, availableFormats } = await getSurroundingAudios(vidIds);
        const length = vids.length;
        console.log(length);
        const formattedResults = vidIdswithSurroundSound.map(vidId => {
            const video = vids.find(vid => vid.videoId === vidId);
            return {
                title: video.title,
                url: video.url,
                formats: availableFormats[vidId]
            };
        });

        res.render('index', { results: formattedResults });
    } catch (err) {
        console.log(err);
        res.send("An error occurred while processing your request.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});