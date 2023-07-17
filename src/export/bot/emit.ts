import request from "request";
import CONFIG from '../../../config.json';

async function emitSlackEvent(channel?: String, user?: String, text?: String, ts?: String, chanType?: String) {
    let headers = {"Content-type": "application/json", "Authorization": CONFIG.SLACK_TOKEN};
    let body = {"type": "event_callback", "event": {"type": "message", "channel": channel, "user": user, "text": text, "ts": ts, "channel_type": chanType}};
    request.post("http://3.36.2.100:5000/slack/events",{headers: headers, body: body, json: true});
}

export = emitSlackEvent;