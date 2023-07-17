import slackAPI from '../export/slackapi';
import handleError from '../export/error';
import { Database } from '../database/db';
import { SlackEvent } from '../export/type';

const COM_CUSTOM = {
    'BOT-300': async (event: SlackEvent, com3: String) => {
        let text = '';
        if (com3) text = handleError("UnknownCommand") + '\n';
        await slackAPI.ephemeral(event.user, event.channel, text + '커스텀 명령어와 관련된 명령어 목록입니다.', '*봇 커스텀 목록* -&gt; 생성된 커스텀 명령어들을 봅니다. \n'
        + '*봇 커스텀 생성 {이름}* [설명] -&gt; 커스텀 명령어를 생성합니다. \n *봇 커스텀 보기 {이름}* -&gt; 커스텀 명령어의 정보를 봅니다. \n'
        + '*봇 커스텀 이벤트 {이름} {이벤트타입} {행동타입}* -&gt; 명령어의 내용을 설정합니다. \n *봇 커스텀 삭제 {이름}* [인덱스] -&gt; 커스텀 명령어를 삭제하거나 명령어의 명령줄을 지웁니다. \n');
        Database.log.write(event, "봇 커스텀", true);
    },

    'BOT-310': async (event: SlackEvent) => {
        await Database.custom.list(async (text: string, check: Boolean) => {
            if (check) {
                await slackAPI.message(event.channel, '*생성된 커스텀 명령어 목록*', text);
            } else {
                await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
            }
        });
        Database.log.write(event, "봇 뽑기 목록", true);
    },

    'BOT-320': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 커스텀 생성 {이름}*');
            Database.log.write(event, "봇 커스텀 생성", false);
        } else if (params[0][0] === '봇') {
            await slackAPI.ephemeral(event.user, event.channel, '오류 : 해당 이름으로 생성할 수 없습니다.', '사용법 : *봇 커스텀 생성 {이름}*');
            Database.log.write(event, "봇 커스텀 생성", false);
        } else if (params[0]) {
            await Database.custom.new(params[0], params[1], async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 생성되었습니다.');
                    Database.log.write(event, "봇 커스텀 생성", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 커스텀 생성", false);
                } 
            });
        }
    },

    'BOT-330': async (event: SlackEvent, params: Array<String>) => {
        if (!params[0] || params[1]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '사용법 : *봇 커스텀 보기 {이름}*');
            Database.log.write(event, "봇 커스텀 보기", false);
        } else if (params[0]) {
            await Database.custom.get(params[0], async (check: Boolean, error?: string, text?: string, attach?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, text!, attach);
                    Database.log.write(event, "봇 커스텀 보기", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 커스텀 보기", false);
                } 
            });
        }
    },

    'BOT-340': async (event:SlackEvent) => {
        await slackAPI.ephemeral(event.user, event.channel, '커스텀 명령어 이벤트 도움말입니다.',
        '*봇 커스텀 이벤트 {이름} {이벤트타입} {행동타입}* \n *{이벤트타입}* -&gt; 명령어의 작동 조건 \n - *command* -&gt; "명령어이름"을 정확히 입력했을 때 작동하는 명령어입니다. \n - *text* -&gt; "명령어이름"이 포함된 메세지를 입력했을 때 작동하는 명령어입니다. \n'
        + '*{행동타입}* -&gt; 명령어의 실행 내용 \n - *message* {메세지내용} -&gt; 이벤트가 발생한 채널에 메세지를 보냅니다. \n - *whisper* {메세지내용} -&gt; 이벤트가 발생한 사용자에게만 보이는 메세지를 보냅니다. \n'
        + '- *run* {봇명령어} -&gt; 이벤트가 발생한 사용자로 명령어를 실행합니다. \n'
        + '|EVENT_USER| -&gt; 이벤트가 발생한 사용자 ID를 반환합니다. \n |EVENT_USERNAME| -&gt; 이벤트가 발생한 사용자 이름을 반환합니다. \n |EVENT_TEXT| -&gt; 이벤트가 발생한 메시지를 반환합니다. \n |COMMAND| -&gt; 이 명령어 이름을 반환합니다.');
        Database.log.write(event, "봇 커스텀 이벤트", true);
    },

    'BOT-341': async (event:SlackEvent, params: Array<String>) => {
        if (!params[0] || !params[1] || !params[2] || !params[3] || params[4]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"),
        '*봇 커스텀 이벤트 {이름} {이벤트타입} {행동타입}* \n *{이벤트타입}* -&gt; 명령어의 작동 조건 \n - *command* -&gt; "명령어이름"을 정확히 입력했을 때 작동하는 명령어입니다. \n - *text* -&gt; "명령어이름"이 포함된 메세지를 입력했을 때 작동하는 명령어입니다. \n'
        + '*{행동타입}* -&gt; 명령어의 실행 내용 \n - *message* {메세지내용} -&gt; 이벤트가 발생한 채널에 메세지를 보냅니다. \n - *whisper* {메세지내용} -&gt; 이벤트가 발생한 사용자에게만 보이는 메세지를 보냅니다. \n'
        + '- *run* {봇명령어} -&gt; 이벤트가 발생한 사용자로 명령어를 실행합니다. \n'
        + '|EVENT_USER| -&gt; 이벤트가 발생한 사용자 ID를 반환합니다. \n |EVENT_USERNAME| -&gt; 이벤트가 발생한 사용자 이름을 반환합니다. \n |EVENT_TEXT| -&gt; 이벤트가 발생한 메시지를 반환합니다. \n |COMMAND| -&gt; 이 명령어 이름을 반환합니다.');
            Database.log.write(event, "봇 커스텀 이벤트", false);
        } else {
            Database.custom.event(params[0], params[1], params[2], params[3], async (check: Boolean, error?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '명령줄이 성공적으로 추가되었습니다.');
                    Database.log.write(event, "봇 커스텀 이벤트", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, error ? error : handleError("Error"));
                    Database.log.write(event, "봇 커스텀 이벤트", false);
                } 
            });
        }
    },

    'BOT-350': async (event:SlackEvent, params: Array<String>) => {
        if (!params[0] || params[1]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '*봇 커스텀 삭제 {이름}* [인덱스]');
            Database.log.write(event, "봇 커스텀 삭제", false);
        } else {
            await Database.custom.delete(params[0], async (check: Boolean, text?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 커스텀 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 커스텀 삭제", false);
                } 
            })
        }
    },

    'BOT-351': async (event:SlackEvent, params: Array<String>) => {
        if (!params[0] || params[1] == null || params[2]) {
            await slackAPI.ephemeral(event.user, event.channel, handleError("ParamError"), '*봇 커스텀 삭제 {이름}* [인덱스]');
            Database.log.write(event, "봇 커스텀 삭제", false);
        } else {
            await Database.custom.delete_event(params[0], params[1], async (check: Boolean, text?: string) => {
                if (check) {
                    await slackAPI.ephemeral(event.user, event.channel, '성공적으로 삭제되었습니다.');
                    Database.log.write(event, "봇 커스텀 삭제", true);
                } else {
                    await slackAPI.ephemeral(event.user, event.channel, text ? text : handleError("Error"));
                    Database.log.write(event, "봇 커스텀 삭제", false);
                } 
            })
        }
    },
}

export default COM_CUSTOM;