const express = require('express');
const path = require('path');
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


app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    res.render('index');
});


app.post('/', async (req, res) => {
    if (!req.body.query) {
        return res.send("Please enter a valid search term ");
    }
    try {
        const query = req.body.query;
        const url = `https://www.youtube.com/results?search_query=${query}`;
        const response = await fetch(url);
        const text = await response.text();

        // let ytInitialData = text.match(/var ytInitialData = ({.*?});/);
        // ytInitialData = ytInitialData[0].replace(/var ytInitialData = |;/g, '');
        // ytInitialData = JSON.parse(ytInitialData);
        // let videoData = [];
        // const contents = ytInitialData.contents;
        // const twoColumnSearchResultsRenderer = contents.twoColumnSearchResultsRenderer;
        // const primaryContents = twoColumnSearchResultsRenderer.primaryContents;
        // const sectionListRenderer = primaryContents.sectionListRenderer;
        // const conts = sectionListRenderer.contents;
        // conts.forEach(section => {
        //     if (section.itemSectionRenderer && section.itemSectionRenderer.contents) {
        //         section.itemSectionRenderer.contents.forEach(item => {
        //             if (item.videoRenderer) {
        //                 const videoRenderer = item.videoRenderer;
        //                 const title = videoRenderer.title.runs[0].text;
        //                 const videoID = videoRenderer.videoId;

        //                 videoData.push({ title, videoID });
        //             }
        //         });
        //     }
        // });

        res.send(text);
    }
    catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }
});


app.post('/getVideoDetails', async (req, res) => {
    if (!req.body.videoId) {
        throw new Error("Please provide a valid video ID");
    }
    try {
        const url = "https://www.youtube.com/watch?v=" + req.body.videoId;
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Accept', 'application/json');
        if(myHeaders.has('Host')) myHeaders.delete('Host');
        myHeaders.append('Host', 'www.youtube.com');
        if(myHeaders.has('Referer')) myHeaders.delete('Referer'); 
            myHeaders.append('Referer', url);
        if(myHeaders.has('origin')) myHeaders.delete('origin');
            myHeaders.append('origin', 'https://www.youtube.com');
        // Remove user-agent header if it is set
        if(myHeaders.has('User-Agent')) {myHeaders.delete('User-Agent');}
        myHeaders.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
        const response = await fetch(url,
            {
                method: 'GET',
                headers: myHeaders
            }
        );
        const text = await response.text();
        res.status(200);
        res.send(text);

    }
    catch (err) {
        console.error(err);
        res.send("An error occurred while processing your request.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
