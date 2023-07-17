import mybatisMapper, { Format } from "mybatis-mapper";
import { SlackEvent } from '../export/type';
import { conn } from "./db";

let format: Format = {language: 'sql', indent: '  '};

export = {
    write: async (event: SlackEvent, command: string, success: Boolean) => {
        mybatisMapper.createMapper(['src/query/log.xml']);
        let query = mybatisMapper.getStatement('log', 'write', { channel: event.channel, user_id: event.user, username: event.username, date: event.ts, command: command, success: success ? 1 : 0 });
        conn.query(query, error => { if (error) console.log(error); });
    },
    get: async (callback: Function) => {
        mybatisMapper.createMapper(['src/query/log.xml']);
        let query = mybatisMapper.getStatement('log', 'get');
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
            } else {
                callback(results);
            }
        });
    }
}