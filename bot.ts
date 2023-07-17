// https://docs.google.com/presentation/d/1ofi60wxyKWFcR9fkOGSGivOE1k4lc6vntlBnWmq8DZc/edit#slide=id.gd627f5e106_3_4

//#region Global Variable
import express, { NextFunction, Request, Response } from 'express';
import CONFIG from './config.json';
import handleEvents from './src/export/bot/events';
import handleInteractions from './src/export/bot/interactions';
import { WebClient } from '@slack/web-api';
import { Database } from './src/database/db';
import helperAPI from './src/api/router';

const PORT = CONFIG.PORT_BOT;
const TOKEN = CONFIG.SLACK_TOKEN;
const web = new WebClient(TOKEN);
const app = express();
let isDisableKeepAlive = false;

//#endregion

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));
app.use('*', function(req: Request, res: Response, next: NextFunction) { if (isDisableKeepAlive) { res.set('Connection', 'close'); } next(); });
app.use('/', helperAPI);
app.post('/slack/events', handleEvents);
app.post('/slack/interaction', handleInteractions);

let server = app.listen(PORT, async () => {
    process.send!('ready');
    console.log(`Server Opened by Port ${PORT}`);
    await Database.vote.init();
});

process.on('SIGINT', function() {
    isDisableKeepAlive = true;
    server.close();
    console.log('server closed');
    process.exit(0);
});

export default web;
