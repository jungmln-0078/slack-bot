import handleError from '../export/error';
import slackAPI from '../export/slackapi';
import { SlackEvent } from '../export/type';
import { Database } from '../database/db';

const COM_ = {
    'BOT-000': async (event: SlackEvent) => {
        await slackAPI.ephemeral(event.user, event.channel, `*Blue Bot 1.2*`
            , '*봇 도움말* -&gt; 명령어 도움말을 봅니다.\n' + '<mailto:jungmln0078@bluedigm.com|문의하기>');
        Database.log.write(event, "봇", true);
    },

    'BOT-010': async (event: SlackEvent) => {
        await slackAPI.ephemeral(event.user, event.channel, '*명령어 목록*',
            '*봇 구글 {검색어}* -&gt; 구글에 검색합니다.\n' +
            '*봇 뽑기* -&gt; 뽑기와 관련된 명령어입니다.\n *봇 투표* -&gt; 투표와 관련된 명령어입니다.\n *봇 커스텀* -&gt; 커스텀 명령어와 관련된 명령어입니다.');
        Database.log.write(event, "봇 도움말", true);
    },
    
    'BOT-020': async (event: SlackEvent, params: Array<string>) => {
        if (params[0] === "") {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"));
            Database.log.write(event, "봇 구글", false);
        } else {
            let query = params[0].split(" ").join("+");
            await slackAPI.message(event.channel, `https://www.google.co.kr/search?q=${query}`);
            Database.log.write(event, "봇 구글", true);
        }
    }
}

export default COM_;