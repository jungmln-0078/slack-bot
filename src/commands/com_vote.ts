import slackAPI from '../export/slackapi';
import handleError from '../export/error';
import { Database } from '../database/db';
import { SlackEvent, VoteValue } from '../export/type';
import { Vote, GLOVAL_VOTE } from '../export/class';

//#region Function

// Create Vote Instance
async function startVote(event: SlackEvent, voteName: string, timeLimit: number, voteValue: Array<any>) {
    let voteValueBlock: Array<VoteValue> = [];
    for(const i in voteValue) {
        voteValueBlock.push({text: { type: "plain_text", text: voteValue[i].value}, value: String(voteValue[i].id)});
    }
    let voteMsg = await slackAPI.message(event.channel, `*${voteName}* 투표가 시작되었습니다.`);
    GLOVAL_VOTE[voteName] = new Vote(event, voteName, voteMsg?.ts!, timeLimit, voteValueBlock);
    GLOVAL_VOTE[voteName]!.voteMsg = voteMsg;
    let blockJSON = JSON.stringify(GLOVAL_VOTE[voteName]?.block);
    await slackAPI.update(event.channel, GLOVAL_VOTE[voteName]?.ts, `*${voteName}* 투표가 시작되었습니다.`, blockJSON);
    await Database.vote.get_vote_id(voteName, event.channel, 't', (vote_id: String) => {
        Database.vote.log(event.channel, GLOVAL_VOTE[voteName]?.ts, vote_id);
    });
    GLOVAL_VOTE[voteName]?.timeTick(event, voteName, timeLimit);
}

//#endregion

const COM_VOTE = {
    'BOT-200': async (event: SlackEvent, com3: String) => {
        let text = '';
        if (com3) text = handleError("UnknownCommand") + '\n';
        await slackAPI.ephemeral(event.user, event.channel, text + '투표와 관련된 명령어 목록입니다.', '*봇 투표 목록* -&gt; 생성된 투표들을 봅니다. \n'
        + '*봇 투표 생성 {이름}* -&gt; 투표를 생성합니다. \n *봇 투표 시작 {이름} {제한시간}* -&gt; 투표를 시작합니다. \n'
        + '*봇 투표 마감 {이름}* -&gt; 투표를 즉시 마감합니다. \n *봇 투표 추가 {이름} {후보}* -&gt; 투표에 후보를 추가합니다. \n'
        + '*봇 투표 삭제 {이름}* [후보] -&gt; 투표를 삭제하거나 후보를 삭제합니다. \n');
        Database.log.write(event, "봇 투표", true);
    },

    'BOT-210': async (event: SlackEvent) => {
        await Database.vote.list(event.channel, async (text: string, check: Boolean) => {
            if (check) {
                await slackAPI.message(event.channel, '*생성된 투표 목록*', text);
            } else {
                await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
            }
        });
        Database.log.write(event, "봇 투표 목록", true);
    },

    'BOT-220': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 생성 {이름}*');
            Database.log.write(event, "봇 투표 생성", false);
        } else if (params[0] && params.length === 1) {
            await Database.vote.new(params[0], event.channel, async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 생성되었습니다.', '');
                    Database.log.write(event, "봇 투표 생성", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 투표 생성", false);
                }
            })
        }
    },

    'BOT-230': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || params[2] || isNaN(Number(params[1]))) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 시작 {이름} {제한시간}*');
            Database.log.write(event, "봇 투표 시작", false);
        } else if (Number(params[1]) < 60 || Number(params[1]) > 7200) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), `입력한 시간 ${params[1]}이 너무 짧거나 깁니다. 60-7200 사이여야 합니다.`);
            Database.log.write(event, "봇 투표 시작", false);
        } else if (params[0] && params[1] && params.length === 2) {
            await Database.vote.get(params[0], event.channel, async (text: string, check: Boolean) => { // 후보 갯수 체크
                if (check) {
                    await Database.vote.start(params[0], event.channel, async (results: any, check: Boolean, error?: string) => { 
                        if (!check) {
                            await slackAPI.ephemeral(event.user, event.channel, error ? error : text ? text : handleError("Error")); 
                            Database.log.write(event, "봇 투표 시작", false); 
                        } else {
                            let values: Array<any> = [];
                            for (const i in results[0]) {
                                values.push({ id: results[0][i].id, value: results[0][i].value});
                            }
                            startVote(event, String(params[0]), Number(params[1]), values);
                            Database.log.write(event, "봇 투표 시작", true);
                        }
                    });
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 투표 시작", false);
                } 
            })
        }
    },

    'BOT-240': async (event: SlackEvent, params: Array<string>) => {
        if (!params[0] || params[1]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 마감 {이름}*');
            Database.log.write(event, "봇 투표 마감", false);
        } else if (params[0] && params.length === 1) {
            await Database.vote.is_started(event.channel, params[0], async (is_started: any) => {
                if (is_started === 1) {
                    GLOVAL_VOTE[params[0]]?.endVote(event);
                    Database.log.write(event, "봇 투표 마감", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, handleError("VoteIsNotStarted"));
                    Database.log.write(event, "봇 투표 마감", false);
                } 
            });
        }
    },

    'BOT-250': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 추가 {이름} {내용}*');
            Database.log.write(event, "봇 투표 추가", false);
        } else if (params[0] && params[1] && params.length === 2) {
            await Database.vote.insert(event.channel, params[0], params[1], async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 추가되었습니다.');
                    Database.log.write(event, "봇 투표 추가", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 투표 추가", false);
                }
            })
        }
    },

    'BOT-260': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 삭제 {이름}* [후보]');
            Database.log.write(event, "봇 투표 삭제", false);
        } else {
            await Database.vote.delete(event.channel, params[0], async (text: string, check: Boolean) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 투표 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 투표 삭제", false);
                } 
            })
        }
    },

    'BOT-261': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 투표 삭제 {이름}* [후보]');  
            Database.log.write(event, "봇 투표 삭제", false);
        } else {
            await Database.vote.delete_value(event.channel, params[0], params[1], async (text: string, check: Boolean) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 투표 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 투표 삭제", false);
                } 
            })
        }
    },
}

export default COM_VOTE;