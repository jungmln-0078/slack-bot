import slackAPI from '../export/slackapi';
import handleError from '../export/error';
import { Database } from '../database/db';
import { SlackEvent } from '../export/type';

const COM_RANDOM = {
    'BOT-100': async (event: SlackEvent, com3: String) => {
        let text = '';
        if (com3) text = handleError("UnknownCommand") + '\n';
        await slackAPI.ephemeral(event.user, event.channel, text + '뽑기와 관련된 명령어 목록입니다.', '*봇 뽑기 목록* -&gt; 생성된 뽑기들을 봅니다. \n'
        + '*봇 뽑기 생성 {이름}* -&gt; 뽑기를 생성합니다. \n *봇 뽑기 실행 {이름}* [횟수] -&gt; 뽑기를 실행합니다. \n'
        + '*봇 뽑기 추가 {이름} {내용}* -&gt; 뽑기에 값을 추가합니다. \n *봇 뽑기 삭제 {이름}* [내용] -&gt; 뽑기를 삭제하거나 값을 삭제합니다. \n');
        Database.log.write(event, "봇 뽑기", true);
    },
    
    'BOT-110': async (event: SlackEvent) => {
        await Database.random.list(async (text: string, check: Boolean) => {
            if (check) {
                await slackAPI.message(event.channel, '*생성된 뽑기 목록*', text);
            } else {
                await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
            }
        });
        Database.log.write(event, "봇 뽑기 목록", true);
    },

    'BOT-120': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 뽑기 생성 {이름}*');
            Database.log.write(event, "봇 뽑기 생성", false);
        } else if (params[0] && params.length === 1) {
            await Database.random.new(params[0], async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 생성되었습니다.');
                    Database.log.write(event, "봇 뽑기 생성", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 뽑기 생성", false);
                } 
            })
        }
    },
    
    'BOT-130': async (event: SlackEvent, params: Array<String>) => {
        if (params[1] == undefined) params[1] = "1";
        if (!params[0] || params[2] || !Number.isInteger(Number(params[1])) || Number(params[1]) < 1) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 뽑기 실행 {이름}* [횟수]');
            Database.log.write(event, "봇 뽑기 실행", false);
        } else if (params[0]) {
            await Database.random.get(params[0], Number(params[1]), async (text: string, attach: string, check: Boolean) => {
                if (check) {
                    await slackAPI.message(event.channel, text, attach);
                    Database.log.write(event, "봇 뽑기 실행", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 뽑기 실행", false);
                }
            })
        }
    },

    'BOT-140': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 뽑기 추가 {이름} {내용}*');
            Database.log.write(event, "봇 뽑기 추가", false);
        } else if (params[0] && params[1] && params.length === 2) {
            await Database.random.insert(params[0], params[1], async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 추가되었습니다.', '');
                    Database.log.write(event, "봇 뽑기 추가", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 뽑기 추가", false);
                }
            })
        }
    },

    'BOT-150': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 뽑기 삭제 {이름}* [내용]');
            Database.log.write(event, "봇 뽑기 삭제", false);
        } else {
            await Database.random.delete(params[0], async (text: string, check: Boolean) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 뽑기 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 뽑기 삭제", false);
                }
            })
        }
    },

    'BOT-151': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 뽑기 삭제 {이름}* [내용]');  
            Database.log.write(event, "봇 뽑기 삭제", false);
        } else {
            await Database.random.delete_value(params[0], params[1], async (text: string, check: Boolean) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 뽑기 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 뽑기 삭제", false);
                }
            })
        }
    },
}

export default COM_RANDOM;