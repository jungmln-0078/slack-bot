import handleError from "../error";
import slackAPI from "../slackapi";
import { Request, Response } from 'express';
import { Database } from "../../database/db";
import { GLOVAL_VOTE } from "../class";
import { VoteValue } from "../type";

async function handleInteractions(req: Request, res: Response) {
    let reqJSON = JSON.parse(req.body?.payload);
    let selected: VoteValue | undefined;
    let timestamp = req.header('X-Slack-Request-Timestamp');
    if ((Date.now() - Number(timestamp) * 1000) >= 10000) { res.sendStatus(408); return; } // 10초 이상 지난 요청이면 끊기
    if (reqJSON.state.values.vote_actions) { selected = reqJSON.state.values.vote_actions.vote_select.selected_option }
    else { selected = undefined; }
    let action_id = reqJSON.actions[0].action_id;
    let user = reqJSON.user.id;
    let channel = reqJSON.container.channel_id;
    if (reqJSON.actions[0].value === 'vote_submit' && selected) { // 투표하기
        let votename = action_id.slice(0, -1);
        if (!GLOVAL_VOTE[votename]?.ts) { slackAPI.ephemeral(user, channel, handleError("BadRequest")); res.sendStatus(200); return; }
        await Database.vote.check(votename, (param: any) => {
            if (param === "1") {
                Database.vote.voteSubmit(channel, String(GLOVAL_VOTE[votename]?.ts), votename, user, Number(selected?.value), (check: Boolean) => {
                    if (check) slackAPI.ephemeral(user, channel, `*${selected?.text.text}* 에 투표하셨습니다.`);
                });
            } else {
                slackAPI.ephemeral(user, channel, handleError("AlreadyVoted"));
            }
        }, user, GLOVAL_VOTE[votename]?.ts);
        res.sendStatus(200);
    } else if (reqJSON.actions[0].value === 'vote_users') { // 투표 참여자 보기
        let voteInfo = action_id.split("|");
        if (!voteInfo[1]) { slackAPI.ephemeral(user, channel, handleError("BadRequest")); res.sendStatus(200); return; }
        Database.vote.users(channel, voteInfo[1], voteInfo[0], (param: any) => {
            let text = '';
            if (param) {
                for (let i = 0; i < param.length; i++) {
                    text += `<@${param[i].user_id}> `;
                }
                text += `(${param.length} 명)`;
                slackAPI.ephemeral(user, channel, text);
            } else {
                slackAPI.ephemeral(user, channel, "아무도 참여하지 않았습니다.");
            }
        });
        res.sendStatus(200);
    }  else {
        res.sendStatus(200);
    }
}

export = handleInteractions;