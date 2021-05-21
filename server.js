'use strict';

const path = require('path');
const express = require('express');
const fetch = require('node-fetch'); 


const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
//app.use(express.urlencoded());
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const appid = process.env.APPID;

const url="https://jlp.yahooapis.jp/FuriganaService/V1/furigana";

app.post('/', async (req, res)=> {

    const response = await fetch(url, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "appid=" + appid + "&grade=" + req.body.grade + "&sentence=" + encodeURIComponent(req.body.sentence)
    });
    res.send(await response.text());
});

