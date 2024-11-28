let totalvideos = 0;
let count = 0;
const availableFormats = [];

function showProgressBar() {
    document.getElementById("progress-bar").style.display = "block";
}

async function onClickSubmit() {
    showProgressBar();
    // get Form Data
    const query = document.getElementById("query").value;
    const invidiousUrl = document.getElementById("invidious_url").value;

    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');


    const vids = await fetch('/', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ query, invidious_url: invidiousUrl })
    }).then(response => response.json());
    console.log(vids);
        totalvideos = vids.length;
    for(let i = 0; i < vids.length; i++) {
        let vid = vids[i];
        console.log(vid);
        const videoResponse = await fetch('/getVideoDetails', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({ videoId: vid.videoId, invidious_url: invidiousUrl })
        });
        count++;
        updateProgress(count);
        if (videoResponse.status === 200) {
            const videoData = videoResponse.data;
            availableFormats.push(videoData);
        }
        else if (videoResponse.status === 204) {
            console.log("Video doesn't have surround sound formats");
        }
        else {
            console.error("An error occurred while processing your request.");
        }
    };
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

document.getElementById('search-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission
    showProgressBar();
    await onClickSubmit();
});