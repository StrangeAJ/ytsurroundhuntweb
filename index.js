const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors(
    {
        origin: '*', // allow to server to accept request from different origin
        credentials: true
    }
));
app.use(express.json());

const port = process.env.PORT || 3000;

const surround_formats = ['256', '258', '325', '327', '328', '338', '380'];


async function fetchInvidiousInstances() {
    try {
        const response = await axios.get('https://api.invidious.io/instances.json?sort_by=type,users');
        const instances = response.data.map((instance) => {
            return { url: instance[1].uri, type: instance[1].type, users: instance[1].users }
        });
        return instances;
    } catch (error) {
        console.error('Error fetching Invidious instances:', error);
        return [];
    }
}

async function searchYouTube(query, invidiousUrl, res) {
    let availableFormats = [];
    let vidIdswithSurroundSound = [];
    let vids = [];
    const url = `${invidiousUrl}/api/v1/search?type=video&q=${query}`;
    try {
        const response = await fetch(url,{
            mode: 'no-cors',
            method: 'GET',
            headers: {
                'Host': invidiousUrl.split('//')[1],
                'Accept': 'application/json',
                'Cookie': 'INVIDIOUS_SERVER_ID=1'
            }
        }).then(response => response.json());
        if(!response.headers.get('content-type').includes('application/json')){
            throw new Error("Invalid Invidious URL");
        }
        vids = response.data; 
    } catch (err) {
        console.error(err);
    }
    return { vids };
}


app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const instances = await fetchInvidiousInstances();
    res.render('index', { availableFormats: [], instances });
});

app.post('/', async (req, res) => {
    if (!req.body.query || !req.body.invidious_url) {
        return res.send("Please enter a valid search term and select an Invidious URL.");
    }

    try {
        const instances = await fetchInvidiousInstances();
        const { vids } = await searchYouTube(req.body.query, req.body.invidious_url);
        const body = { results: vids, instances, invidiousUrl: req.body.invidious_url, availableFormats: [] };
        res.send(JSON.stringify(body));
    } catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }
});


app.post('/getVideoDetails', async (req, res) => {
    console.log("POST REQUEST ON /  videoId:" + req.body.videoId + " url :" + req.body.invidious_url);
    if (!req.body.videoId || !req.body.invidious_url) {
        throw new Error("Please provide a valid video ID and Invidious URL.");
    }
    try {
        const videoId = req.body.videoId;
        const invidiousUrl = req.body.invidious_url;
        const videoUrl = `${invidiousUrl}/api/v1/videos/${videoId}`;
        const videoResponse = await fetch(videoUrl, {
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
            res.status(200);
            const body = { id: videoId, name: videoData.title, formats: availableSurroundFormats, url: invidiousUrl + '/watch?v=' + videoId };
            res.send(body);
        }
        else{
            res.sendStatus(204);
        }
    } catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
