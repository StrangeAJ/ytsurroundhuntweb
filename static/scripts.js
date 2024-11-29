let totalvideos = 0;
let count = 0;
let myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept', 'application/json');
let availableFormats = [];
let vids = [];

function showProgressBar() {
    document.getElementById("progress-bar").style.display = "block";
}

async function onClickSubmit() {
    const query = document.getElementById("query").value;
    const response = await fetch('/', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ query })
    });

    const text = await response.text();

    let ytInitialData = text.match(/var ytInitialData = ({.*?});/);
    ytInitialData = ytInitialData[0].replace(/var ytInitialData = |;/g, '');
    console.log(ytInitialData);
    ytInitialData = JSON.parse(ytInitialData);
    const contents = ytInitialData.contents;
    const twoColumnSearchResultsRenderer = contents.twoColumnSearchResultsRenderer;
    const primaryContents = twoColumnSearchResultsRenderer.primaryContents;
    const sectionListRenderer = primaryContents.sectionListRenderer;
    const conts = sectionListRenderer.contents;
    conts.forEach(section => {
        if (section.itemSectionRenderer && section.itemSectionRenderer.contents) {
            section.itemSectionRenderer.contents.forEach(item => {
                if (item.videoRenderer) {
                    const videoRenderer = item.videoRenderer;
                    const title = videoRenderer.title.runs[0].text;
                    const videoID = videoRenderer.videoId;

                    vids.push({ title, videoID });
                }
            });
        }
    });

    totalvideos = vids.length || 0;
    if (vids.length === 0) {
        console.error("No videos found");
        hideProgressBar();
    } else {
        await getVideoDetails(vids);
    }
}

async function getVideoDetails(vids) {
    for (const vid of vids) {
        let id = vid.videoID;
        const response = await fetch('/getVideoDetails', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ videoId: id })
        });
        const text = await response.text();
        console.log(text);
        let ytInitialPlayerResponse = text.match(/var ytInitialPlayerResponse = ({.*?});/);
        ytInitialPlayerResponse = ytInitialPlayerResponse[0].replace(/var ytInitialPlayerResponse = |;/g, '');
        ytInitialPlayerResponse = JSON.parse(ytInitialPlayerResponse);
        console.log(ytInitialPlayerResponse);
        const adaptiveFormats = ytInitialPlayerResponse.streamingData.adaptiveFormats;
        let rawAvaliableFormats = [];
        adaptiveFormats.forEach(format => {
            if (format.audioChannels && format.audioChannels > 2) {
                rawAvaliableFormats.push(format);
            }
        });
        // res.status(200);
        // res.json(availableFormats);



        count++;
        updateProgress(count);
        if (rawAvaliableFormats.length === 0) {
            console.log("No video data found");
        } else {
            const url = `https://www.youtube.com/watch?v=${id}`;
            const formats = rawAvaliableFormats.map(format => format.itag);
            const name = vid.title;
            availableFormats.push({ url, formats, name, id });
        }

        await new Promise(r => setTimeout(r, 300));
    }
    renderVideoDetails();
}

function hideProgressBar() {
    document.getElementById("progress-bar").style.display = "none";
}

function updateProgress(count) {
    const progressBar = document.querySelector('.progress-bar-inner');
    const percentage = (count / totalvideos) * 100;
    progressBar.style.width = percentage + '%';
    progressBar.innerText = percentage + '%';
}

function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || getSystemTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
}

function renderVideoDetails() {
    const resultsContainer = document.getElementById('results') || document.createElement('div');
    resultsContainer.id = 'results';
    resultsContainer.innerHTML = ''; // Clear previous results
    availableFormats.forEach((result) => {
        const videoElement = document.createElement('div');
        videoElement.innerHTML = `
            <h3>
                <a href="${result.url}" target="_blank">
                    <i class="fa-brands fa-youtube" style="color: gray"></i>
                </a>
                ${result.name}
            </h3>
            <table border="1" style="margin: 0 auto">
                <thead>
                    <tr>
                        <th>Format ID</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.formats.map(format => `
                        <tr>
                            <td>
                                <a href="https://inv.nadeko.net/latest_version?id=${result.id}&itag=${format}">
                                    ${format}
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        resultsContainer.appendChild(videoElement);
    });
    if (availableFormats.length === 0) {
        resultsContainer.innerHTML = `
            <h1>No MultiChannel Audio Found</h1>
        `;
    }
    hideProgressBar();
    document.body.appendChild(resultsContainer);
}

async function btnClick() {
    showProgressBar();
    await onClickSubmit();
}

window.onload = function () {
    hideProgressBar();
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme || getSystemTheme();
    setTheme(theme);
    window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
        if (!localStorage.getItem("theme")) {
            setTheme(e.matches ? "dark" : "light");
        }
    });
};
