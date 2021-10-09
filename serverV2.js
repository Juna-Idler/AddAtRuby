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

const url="https://jlp.yahooapis.jp/FuriganaService/V2/furigana";

app.post('/', async (req, res)=> {

    const param =
    {
        "id": "1234-1",
        "jsonrpc": "2.0",
        "method": "jlp.furiganaservice.furigana",
        "params": {
          "q": req.body.sentence,
          "grade": req.body.grade
        }
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Yahoo AppID: " + appid,
        },
        body:JSON.stringify({
            "id": "1234-1",
            "jsonrpc": "2.0",
            "method": "jlp.furiganaservice.furigana",
            "params": {
              "q": req.body.sentence,
              "grade": req.body.grade
            }
        })
    });
    res.send(await response.text());
});

