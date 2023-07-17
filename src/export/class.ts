import slackAPI from "./slackapi";
import { Database } from "../database/db";
import { SlackEvent, VoteResult, VoteValue } from "./type";

var GLOVAL_VOTE: {[index: string]: Vote} = {};

class Vote {
    block: any;
    name: string;
    timeLimit: number;
    values: Array<VoteValue>;
    actions: Array<any>;
    interval!: NodeJS.Timeout;
    voteMsg!: any;
    ts: string;
    channel: string;
    blocktext: string;
    timeString(timeRaw: number) {
        let sec, min, hour;
        hour = Math.floor(timeRaw / 3600);
        min = Math.floor((timeRaw - hour * 3600) / 60);
        sec = timeRaw - (hour * 3600 + min * 60);
        if (timeRaw >= 3600) {
            if (min === 0 && sec === 0) return `${hour}시간`;
            if (sec === 0) return `${hour}시간 ${min}분`;
            if (min === 0) return `${hour}시간 ${sec}초`;
            return `${hour}시간 ${min}분 ${sec}초`;
        } else if (timeRaw >= 60) {
            if (sec === 0) return `${min}분`;
            return `${min}분 ${sec}초`;
        } else {
            return `${sec}초`;
        }
    };
    async endVote(event: SlackEvent) {
        clearInterval(this.interval);
        await slackAPI.message(this.channel, `*${this.name}* 투표가 마감 되었습니다.`);
        Database.vote.end(this.name, this.ts, this.channel, async (results: any) => {
            if (results[0]) {
                let resultArr: Array<VoteResult> = [], attach = '', maxCnt = 0;
                for(const i in results[0]) {
                    maxCnt += results[0][i].count;
                }
                for(const i in results[0]) {
                    let per: number = (maxCnt === 0 ? 0 : (results[0][i].count / maxCnt) * 100);
                    resultArr.push({value: results[0][i].value, count: results[0][i].count, percent: per, bar: ''});
                }
                for(const i in resultArr) {
                    let barCnt = resultArr[i].percent * 20 / 100;
                    let bar = ':large_blue_square:'.repeat(barCnt); resultArr[i].bar = bar;
                    attach += `${resultArr[i].value} : ${resultArr[i].bar}   ${resultArr[i].percent.toFixed(2)}%  (${resultArr[i].count}) \n`;
                }
                await slackAPI.message(this.channel, `*${this.name}* 투표의 결과입니다. 참여 수 : ${maxCnt}`, attach);
                this.blocktext = `*${this.name}* 투표가 마감되었습니다.`;
                this.actions.shift(); this.actions.shift();
                slackAPI.update(this.channel, this.ts, `*${this.name}* 투표의 결과입니다.`, this.block);
                Database.vote.users(this.channel, this.ts, this.name, (param: any) => {
                    let text = '';
                    if (param) {
                        for (let i = 0; i < param.length; i++) {
                            text += `<@${param[i].user_id}> `;
                        }
                        text += `(${param.length} 명)`;
                        slackAPI.ephemeral(event.user, this.channel, text);
                    } else {
                        slackAPI.ephemeral(event.user, this.channel, "아무도 참여하지 않았습니다.");
                    }
                });
            }
            });
    };
    timeTick(event: SlackEvent, name: string, time: number) {
        let sec = 0, remainTime = 0;
        this.interval = setInterval(() => {
            sec++; remainTime = time - sec;
            if (remainTime === 0) {
                this.endVote(event);
            }
            if (remainTime % 300 === 0 && remainTime !== 0 && sec !== 0 || remainTime === 10) {
                slackAPI.message(event.channel, `*${name}* 투표 종료까지 ${this.timeString(remainTime)} 남았습니다.`);
            }
        }, 1000);
    };
    
    constructor(event: SlackEvent, name: string, ts: string, timeLimit: number, values: Array<VoteValue>) {
        this.name = name;
        this.ts = ts;
        this.timeLimit = timeLimit;
        this.values = values;
        this.channel = event.channel;
        this.blocktext = `*${this.name}* 투표가 시작되었습니다. [제한시간 : ${this.timeString(this.timeLimit)}]`;
        this.actions = [
            {
                "type": "static_select",
                "action_id": "vote_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "후보를 선택하세요",
                },
                "options": 
                    this.values,
            },
            {
                "type": "button",
                "action_id": `${this.name}*`,
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "투표하기",
                },
                "style": "primary",
                "value": "vote_submit",
            },
            {
                "type": "button",
                "action_id": `${this.name}|${this.ts}`,
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "참여자 보기",
                },
                "value": "vote_users",
            }
        ]
        this.block = [
        {
            "type": "section",
            "block_id": "vote_section",
            "text": {
                "type": "mrkdwn",
                "text": `${this.blocktext}`,
            },
        },
        {
            "type": "actions",
            "block_id": "vote_actions",
            "elements": this.actions
        }]
    }
} 

export { Vote, GLOVAL_VOTE };