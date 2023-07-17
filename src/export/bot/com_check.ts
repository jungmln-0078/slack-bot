import Command from '../../commands/com';
import timestamp from '../timestamp';
import handleError from '../error';
import paramCheck from './param_check';
import slackAPI from '../slackapi';
import { SlackEvent } from '../type';

async function commandCheck(event: SlackEvent, rawCommand: String) {
    let command = rawCommand.split(' ');
    let paramRaw = [], params = [];
    if (command[0] === '봇') {
        console.log(`${timestamp()} ${event.username} : ${command.join(" ")}`);
        if (!command[1] && !command[2]) {
            Command['BOT-000'](event);
        } else if (command[1] === '도움말' && !command[2]) {
            Command['BOT-010'](event);
        } else if (command[1] === '구글') {
            paramRaw = rawCommand.split("봇 구글 ")!;
            params = await paramCheck(paramRaw[1]);
            Command['BOT-020'](event, params);
        } else if (command[1] === '뽑기') {
            if (command[2] === '목록') {
                Command['BOT-110'](event);
            } else if (command[2] === '생성') {
                paramRaw = rawCommand.split("봇 뽑기 생성 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-120'](event, params);
            } else if (command[2] === '실행') {
                paramRaw = rawCommand.split("봇 뽑기 실행 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-130'](event, params);
            } else if (command[2] === '추가') {
                paramRaw = rawCommand.split("봇 뽑기 추가 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-140'](event, params);
            } else if (command[2] === '삭제') {
                paramRaw = rawCommand.split("봇 뽑기 삭제 ")!;
                params = await paramCheck(paramRaw[1]);
                if (params[1] === undefined) {
                    Command['BOT-150'](event, params);
                } else {
                    Command['BOT-151'](event, params);
                }
            } else {
                Command['BOT-100'](event, command[2]);
            }
        } else if (command[1] === '투표') {
            if (command[2] === '목록') {
                Command['BOT-210'](event);
            } else if (command[2] === '생성') {
                paramRaw = rawCommand.split("봇 투표 생성 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-220'](event, params);
            } else if (command[2] === '시작') {
                paramRaw = rawCommand.split("봇 투표 시작 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-230'](event, params);
            } else if (command[2] === '마감') {
                paramRaw = rawCommand.split("봇 투표 마감 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-240'](event, params);
            } else if (command[2] === '추가') {
                paramRaw = rawCommand.split("봇 투표 추가 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-250'](event, params);
            } else if (command[2] === '삭제') {
                paramRaw = event.text?.split("봇 투표 삭제 ")!;
                params = await paramCheck(paramRaw[1]);
                if (params[1] === undefined) {
                    Command['BOT-260'](event, params);
                } else {
                    Command['BOT-261'](event, params);
                }
            } else {
                Command['BOT-200'](event, command[2]);
            }
        } else if (command[1] === '커스텀') {
            if (command[2] === '목록') {
                Command['BOT-310'](event);
            }
            else if (command[2] === '생성') {
                paramRaw = rawCommand.split("봇 커스텀 생성 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-320'](event, params);
            } else if (command[2] === '보기') {
                paramRaw = rawCommand.split("봇 커스텀 보기 ")!;
                params = await paramCheck(paramRaw[1]);
                Command['BOT-330'](event, params);
            } else if (command[2] === '이벤트') {
                if (!command[3]) {
                    Command['BOT-340'](event);
                } else {
                    paramRaw = rawCommand.split("봇 커스텀 이벤트 ")!;
                    params = await paramCheck(paramRaw[1]);
                    Command['BOT-341'](event, params);
                }
            } else if (command[2] === '삭제') {
                paramRaw = event.text?.split("봇 커스텀 삭제 ")!;
                params = await paramCheck(paramRaw[1]);
                if (params[1] === undefined) {
                    Command['BOT-350'](event, params);
                } else {
                    Command['BOT-351'](event, params);
                }
            } else {
                Command['BOT-300'](event, command[2]);
            }
        } else {
            slackAPI.ephemeral(event.user, event.channel, handleError("UnknownCommand"));
        }
    } else {
        return true;
    }
}

export = commandCheck;