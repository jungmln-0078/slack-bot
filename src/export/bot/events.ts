import web from '../../..';
import slackAPI from '../slackapi';
import commandCheck  from './com_check';
import { Request, Response } from 'express';
import { SlackEvent } from '../type';
import { Database } from '../../database/db';
import emitSlackEvent from './emit';

async function handleEvents(req: Request, res: Response) {
    let body = req.body; 
    let event: SlackEvent = body?.event;
    let chanCheck = false;
    if (body?.type === 'event_callback') {
        let chan = await web.conversations.list({types:'public_channel,private_channel'});
        let channels = chan.channels!;
        let notExecuted = false;
        for (let i = 0; i < channels.length; i++) {
            if (channels[i].id === event.channel && channels[i].is_member) { chanCheck = true; break; }
        }
        event.username = await slackAPI.getName(event.user!) || '';
        if (event.type === 'message' && event.username !== 'Blue Bot' && event.username && (chanCheck || event.channel_type === "im")) {
            if (event.text?.includes(' | ')) {
                let queue = event.text.split(' | ');
                for (const comm of queue) {
                    notExecuted = await commandCheck(event, comm) || false;
                }
            } else {
                notExecuted = await commandCheck(event, event.text) || false;
            }
        }
        if (notExecuted) {
            Database.custom.get_list(async (results: any) => {
                if (results) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].event === 'command' && results[i].name === event.text) {
                            let value = String(results[i].value);
                            value = value.replace('|EVENT_USER|', event.user);
                            value = value.replace('|EVENT_USERNAME|', event.username!);
                            value = value.replace('|EVENT_TEXT|', event.text);
                            value = value.replace('|COMMAND|', results[i].name);
                            if (results[i].behavior === 'message') {
                                await slackAPI.message(event.channel, value);
                            } else if (results[i].behavior === 'whisper') {
                                await slackAPI.ephemeral(event.user, event.channel, value);
                            } else if (results[i].behavior === 'run') {
                                await emitSlackEvent(event.channel, event.user, value, event.ts, event.channel_type);
                            }
                        } else if (results[i].event === 'text' && event.text.includes(results[i].name)) {
                            let value = String(results[i].value);
                            value = value.replace('|EVENT_USER|', event.user);
                            value = value.replace('|EVENT_USERNAME|', event.username!);
                            value = value.replace('|EVENT_TEXT|', event.text);
                            value = value.replace('|COMMAND|', results[i].name);
                            if (results[i].behavior === 'message') {
                                await slackAPI.message(event.channel, value);
                            } else if (results[i].behavior === 'whisper') {
                                await slackAPI.ephemeral(event.user, event.channel, value);
                            } else if (results[i].behavior === 'run') {
                                await emitSlackEvent(event.channel, event.user, value, event.ts, event.channel_type);
                            }
                        }
                    }
                }
            });
        }
    } else if (body?.type === 'url_verification') {
        res.send(body.challenge);
        return;
    }
    res.sendStatus(200);
}
export = handleEvents;