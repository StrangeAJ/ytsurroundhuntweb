const express = require('express');
const path = require('path');


const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { results: null });
});

app.use(express.static(path.join(__dirname, 'static')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});