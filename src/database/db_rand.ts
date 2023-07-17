import mybatisMapper, { Format } from "mybatis-mapper";
import handleError from "../export/error";
import { conn } from "./db";

let format: Format = {language: 'sql', indent: '  '};

export = {
    // 뽑기 목록
    list: async (callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/random.xml' ]);
        let query = mybatisMapper.getStatement('random', 'list');
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), false);
            } else {
                if (results[0]) {
                    let list: {[index: string]: any} = {}; let text = '';
                    for (let i = 0; i < results.length; i++) {
                        if (!list[results[i].name]) list[results[i].name] = [];
                        list[results[i].name].push(results[i].value);
                    }
                    for (const key in list) {
                        text += `*${key}* : ${list[key]} \n`;
                    }
                    callback(text, true);
                } else {
                    callback(handleError("NoRandomCreated"), false);
                }
            }
        });
    },

    // 뽑기 생성
    new: async (name: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/random.xml' ]);
        let query = mybatisMapper.getStatement('random', 'new', {name: String(name)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else {
                callback(true);
            }
        });
    },

    // 뽑기 실행
    get: async (name: String, count: Number, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/random.xml' ]);
        let query = mybatisMapper.getStatement('random', 'get', {name: String(name)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), null, false);
            } else {
                let text = '', attach = '', values = [];
                if (results[0]) {
                    if (results[0].value) {
                        if (results.length < 2) { 
                            callback(handleError("TooLittleRandomValue"), null, false);
                            return;
                        }
                        text += `\n뽑기 *${results[0].name}* 을(를) ${count} 번 실행한 결과입니다. \n`;
                        for (let i = 0; i < results.length; i++) {
                            values.push(results[i].value);
                        }
                        text += `가능한 값 : ${values} \n`;
                        for (let i = 0; i < count; i++) {
                            let randomKey = Math.floor(Math.random() * values.length);
                            attach += `*${values[randomKey]}* `;
                        }
                        callback(text, attach, true);
                    } else {
                        callback(handleError("NoValueOnRandom"), null, false);
                    }
                } else {
                    callback(handleError("RandomNotExists"), null, false);
                }
            }
        });
    },

    // 뽑기 추가
    insert: async (name: String, value: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/random.xml']);
        let query = mybatisMapper.getStatement('random', 'getid', { name: String(name) }, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(false, handleError(error));
            } else {
                let random_id = results[0].id;
                let query = mybatisMapper.getStatement('random', 'insert', { random_id: random_id, value: String(value) }, format);
                conn.query(query, async function (error, results) {
                    if (error) {
                        console.log(error);
                        callback(false, handleError(error));
                    } else {
                        callback(true);
                    }
                });
            }
        })
    },

    // 뽑기 삭제
    delete: async (name: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/random.xml' ]);
        let query = mybatisMapper.getStatement('random', 'delete_random', {name: String(name)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), false);
            } else {
                if (results.affectedRows === 0) callback(handleError("NotExists"), false);
                else callback(null, true);
            }
        });
    },

    // 뽑기 삭제 (값 삭제)
    delete_value: async (name: String, value: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/random.xml']);
        let query = mybatisMapper.getStatement('random', 'getid', { name: String(name) }, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), false);
            } else {
                let random_id = results[0].id;
                let query = mybatisMapper.getStatement('random', 'delete_value', { random_id: random_id || 0, value: String(value) }, format);
                conn.query(query, async function (error, results) {
                    if (error) {
                        console.log(error);
                        callback(handleError(error), false);
                    } else {
                        if (results.affectedRows === 0) callback(handleError("NotExists"), false);
                        else callback(null, true);
                    }
                });
            }
        });  
    },
}