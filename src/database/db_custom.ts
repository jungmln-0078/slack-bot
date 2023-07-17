import mybatisMapper, { Format } from "mybatis-mapper";
import handleError from "../export/error";
import { conn } from "./db";

let format: Format = {language: 'sql', indent: '  '};

export = {
    // 커스텀 명령어 목록
    list: async (callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/custom.xml' ]);
        let query = mybatisMapper.getStatement('custom', 'list');
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), false);
            } else {
                if (results[0]) {
                    let text = '';
                    for (let i = 0; i < results.length; i++) {
                        text += `*${results[i].name}* 설명: ${results[i].desc ? results[i].desc : "없음"} \n`;
                    }
                    callback(text, true);
                } else {
                    callback(handleError("NoCustomCreated"), false);
                }
            }
        });
    },

    // 커스텀 명령어 생성
    new: async (name: String, desc: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/custom.xml' ]);
        let query = mybatisMapper.getStatement('custom', 'new', {name: String(name), desc: desc ? String(desc) : ""}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else {
                callback(true);
            }
        });
    },

    // 커스텀 명령어 이벤트 생성
    event: async (name: String, event: String, behavior: String, value: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/custom.xml' ]);
        let query = mybatisMapper.getStatement('custom', 'getid', {name: String(name)});
        conn.query(query, (error, results) => {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else if (results[0]) {
                let custom_id = results[0].id;
                let query = mybatisMapper.getStatement('custom', 'event', {custom_id: custom_id, event: String(event), behavior: String(behavior), value: String(value)});
                conn.query(query, (error, results) => {
                    if (error) {
                        console.log(error);
                        callback(false, handleError(error) + '\n>*봇 커스텀 이벤트 {이름} {이벤트타입} {행동타입}* \n> *{이벤트타입}* -&gt; 명령어의 작동 조건 \n> - *command* -&gt; "명령어이름"을 정확히 입력했을 때 작동하는 명령어입니다. \n> - *text* -&gt; "명령어이름"이 포함된 메세지를 입력했을 때 작동하는 명령어입니다. \n>'
                        + '*{행동타입}* -&gt; 명령어의 실행 내용 \n> - *message* {메세지내용} -&gt; 이벤트가 발생한 채널에 메세지를 보냅니다. \n> - *whisper* {메세지내용} -&gt; 이벤트가 발생한 사용자에게만 보이는 메세지를 보냅니다. \n>'
                        + '- *run* {봇명령어} -&gt; 이벤트가 발생한 사용자로 명령어를 실행합니다. \n>'
                        + '|EVENT_USER| -&gt; 이벤트가 발생한 사용자를 반환합니다. \n> |EVENT_TEXT| -&gt; 이벤트가 발생한 메시지를 반환합니다. \n> |COMMAND| -&gt; 이 명령어 이름을 반환합니다.');
                    } else {
                        callback(true);
                    }
                })
            } else {
                callback(false, handleError("CustomNotFound"));
            }
        });
    },

    // 커스텀 명령어 보기
    get: async (name: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/custom.xml' ]);
        let query = mybatisMapper.getStatement('custom', 'getid', {name: String(name)});
        conn.query(query, (error, results) => {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else if (results[0]) {
                let custom_id = results[0].id;
                let query = mybatisMapper.getStatement('custom', 'get', {custom_id: custom_id});
                conn.query(query, (error, results) => {
                    if (error) {
                        console.log(error);
                        callback(false, handleError(error));
                    } else {
                        if (results[0]) {
                            let text = '', attach = '';
                            text += `커스텀 명령어 *${name}*의 내용입니다. \n`;
                            text += `설명 : ${results[0].desc ? results[0].desc : '없음'} \n`;
                            for(let i = 0; i < results.length; i++) {
                                attach += `*${i}* | ${results[i].event} ${results[i].behavior} "${results[i].value}" \n`;
                            }
                            callback(true, null, text, attach);
                        } else {
                            callback(false, handleError("CustomNotFound"));
                        }
                    }
                });
            }
        });
    },

    //커스텀 명령어 삭제
    delete: async (name: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/custom.xml']);
        let query = mybatisMapper.getStatement('custom', 'getid', { name: String(name) });
        conn.query(query, async (error, results) => {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else if (results[0]) {
                let custom_id = results[0].id;
                let query = mybatisMapper.getStatement('custom', 'delete', { custom_id: custom_id }, format);
                conn.query(query, async (error, results) => {
                    if (error) {
                        console.log(error);
                        callback(false, handleError(error));
                    } else {
                        if (results.affectedRows === 0) callback(false, handleError("NotExists"));
                        else callback(true);
                    }
                });
            } else {
                callback(false, handleError("NotExists"));
            }
        });
    },

    //커스텀 명령어 명령줄 삭제
    delete_event: async (name: String, index: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/custom.xml']);
        let query = mybatisMapper.getStatement('custom', 'getid', { name: String(name) });
        conn.query(query, async (error, results) => {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else if (results[0]) {
                let custom_id = results[0].id;
                let query = mybatisMapper.getStatement('custom', 'get', { custom_id: custom_id });
                conn.query(query, async (error, eventList) => {
                    if (error) {
                        console.log(error);
                        callback(false, handleError(error));
                    } else {
                        let i = eventList[Number(index)] ? eventList[Number(index)].index : -1;
                        let query = mybatisMapper.getStatement('custom', 'delete_event', { index: i }, format);
                        conn.query(query, async (error, results) => {
                            if (error) {
                                console.log(error);
                                callback(false, handleError(error));
                            } else {
                                if (results.affectedRows === 0) callback(false, handleError("NotExists"));
                                else callback(true);
                            }
                        });
                    }
                });

            } else {
                callback(false, handleError("NotExists"));
            }
        });
    },

    get_list: async (callback: Function) => {
        mybatisMapper.createMapper(['src/query/custom.xml']);
        let query = mybatisMapper.getStatement('custom', 'get_list');
        conn.query(query, (error, results) => {
            if (results[0]) {
                callback(results);
            }
        });
    }
}