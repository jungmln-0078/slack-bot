import mybatisMapper, { Format } from "mybatis-mapper";
import { MysqlError } from "mysql";
import handleError from "../export/error";
import { conn, Database } from "./db";

let format: Format = {language: 'sql', indent: '  '};

async function check(name: String, channel: String, callback: Function) {
    mybatisMapper.createMapper(['src/query/vote.xml']);
    let query = mybatisMapper.getStatement('vote', 'is_started', { name: String(name), channel: String(channel) }, format);
    conn.query(query, async function (error, results) {
        callback(results, error);
    });
}

async function get_log_id(channel: String, ts: String, vote_id: String, callback: Function) {
    mybatisMapper.createMapper(['src/query/vote.xml']);
    let query = mybatisMapper.getStatement('vote', 'get_log_id', { channel: String(channel), ts: String(ts), vote_id: String(vote_id) }, format);
    conn.query(query, async function (error, results) {
        callback(results[0].id);
    });
}

export = {
    // 투표 목록
    list: async (channel: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/vote.xml' ]);
        let query = mybatisMapper.getStatement('vote', 'list', {channel: String(channel)});
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
                    callback(handleError("NoVoteCreated"), false);
                }
            }
        });
    },

    // 투표 생성
    new: async (name: String, channel: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'dupvote', { name: String(name), channel: String(channel) }, format)
        conn.query(query, async function (error, result) {
            if (result) {
                if (result[0]) {
                    callback(false, handleError("AlreadyExists"));
                } else {
                    let query = mybatisMapper.getStatement('vote', 'new', { name: String(name), channel: String(channel) }, format);
                    conn.query(query, async function (error, results) {
                        if (error) {
                            console.log(error);
                            callback(false, handleError(error));
                        } else {
                            callback(true);
                        }
                    });
                }
            } 
        });
    },

    // 투표 시작 (시작 전 검사)
    get: async (name: String, channel: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/vote.xml' ]);
        let query = mybatisMapper.getStatement('vote', 'get', {name: String(name), channel: String(channel)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error), false);
            } else {
                if (results[0]) {
                    if (results[0].cnt < 2) {
                        callback(handleError("TooLittleCandidate"), false);
                    } else if (results[0].is_started) {
                        callback(handleError("VoteAlreadyStarted"), false);
                    } else if (results[0].is_deleted) {
                        callback(handleError("VoteNotFound"), false);
                    } else {
                        callback(null, true);
                    }
                } else {
                    callback(handleError("VoteNotFound"), false);
                }
            }
        });
    },

    // 투표 시작
    start: async (name: String, channel: String, callback: Function) => {
        mybatisMapper.createMapper([ 'src/query/vote.xml' ]);
        let query = mybatisMapper.getStatement('vote', 'start', {name: String(name), channel: String(channel)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(null, false, handleError(error));
            } else {
                if (results[0][0]) {
                    if(!results[0][0].name) callback(null, false, handleError("VoteNotFound"));
                    else callback(results, true);
                } else {
                    callback(null, false, handleError("VoteNotFound"));
                }
            }
        });
    },

    // 사용자 체크
    check: async (name: String, callback: Function, userid?: String, ts?: String) => {
        if (!name) return null;
        mybatisMapper.createMapper([ 'src/query/vote.xml' ]);
        let query = mybatisMapper.getStatement('vote', 'check', {name: String(name), user_id: String(userid), ts: String(ts)}, format);
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
                callback(handleError(error));
            } else {
                if (results) {
                    if (results !== []) {
                        callback("1");
                    } else {
                        callback(handleError("Error"));
                    } 
                } else {
                    callback("1");
                }
            }
        });
    },

    // 사용자 목록
    users: async (channel: String, ts: String, name: String, callback: Function) => {
        if (!name) return null;
        mybatisMapper.createMapper(['src/query/vote.xml']);
        check(name, channel, (results1: any) => {
            let query = mybatisMapper.getStatement('vote', 'users', { channel: String(channel), ts: String(ts), name: String(name), vote_id: results1[0].id }, format);
            conn.query(query, async function (error, results) {
                if (error) {
                    console.log(error);
                    callback(false);
                } else {
                    if (results) {
                        if (results[0]) {
                            callback(results);
                        } else {
                            callback(false);
                        }
                    } else {
                        callback(false);
                    }
                }
            });
        });
    },

    // 투표 추가
    insert: async (channel: String, name: String, value: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        check(name, channel, (results: any) => {
            if (results[0]) {
                let vote_id = results[0].id;
                if (results[0].is_started) {
                    callback(false, handleError("CannotModifyVote"));
                } else {
                    let query = mybatisMapper.getStatement('vote', 'dupvalue', { vote_id: vote_id, value: String(value) }, format);
                    conn.query(query, async function (error, result) {
                        if (result) {
                            if (result[0]) {
                                callback(false, handleError("AlreadyExists"));
                            } else {
                                let query = mybatisMapper.getStatement('vote', 'insert', { vote_id: vote_id, value: String(value) }, format);
                                conn.query(query, async function (error, results) {
                                    if (error) {
                                        console.log(error);
                                        callback(false, handleError(error));
                                    } else {
                                        callback(true);
                                    }
                                });
                            }
                        }
                    });
                }
            } else {
                callback(false, handleError("VoteNotFound"));
            }
        });
    },

    // 투표 삭제
    delete: async (channel: String, name: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        check(name, channel, (results: any) => {
            if (results[0]) {
                if (results[0].is_started) {
                    callback(handleError("CannotModifyVote"), false);
                } else {
                    let query = mybatisMapper.getStatement('vote', 'delete_vote', { name: String(name), channel: String(channel) }, format);
                    conn.query(query, async function (error, results) {
                        if (error) {
                            console.log(error);
                            callback(handleError(error), false);
                        } else {
                            if (results.affectedRows === 0) callback(handleError("VoteNotFound"), false);
                            else callback(null, true);
                        }
                    });
                }
            }  else {
                callback(handleError("VoteNotFound"), false);
            }
        });
    },

    // 투표 삭제 (값 삭제)
    delete_value: async (channel: String, name: String, value: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        check(name, channel, (results: any) => {
            if (results[0]) {
                if (results[0].is_started) {
                    callback(handleError("CannotModifyVote"), false);
                } else {
                    let query = mybatisMapper.getStatement('vote', 'delete_value', { vote_id: results[0].id, value: String(value) }, format);
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
            } else {
                callback(handleError("NotExists"), false);
            }  
        });
    },

    // 투표 마감
    end: async (name: String, ts: String, channel: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'end', { name: String(name), ts: String(ts), channel: String(channel) }, format);
        conn.query(query, async function (error, results) {
            if (error) console.log(error);
            else {

                callback(results);
            }
        });
    },

    // 투표하기
    voteSubmit: async (channel: String, ts: String, name: String, userid: String, value: Number, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'getvalue', { name: String(name) });
        conn.query(query, async function (error, results1) {
            let vote_id = results1[0].id;
            await get_log_id(String(channel), String(ts), vote_id, (log_id: String) => {
                let query = mybatisMapper.getStatement('vote', 'vote', { log_id: String(log_id), vote_id: vote_id, user_id: String(userid), value_id: Number(value) }, format);
                conn.query(query, async function (error, results2) {
                    if (error) console.log(error);
                    else callback(true);
                });
            });
        })
    },

    get_vote_id: async (name: String, channel: String, select_deleted: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'get_vote_id', { name : String(name), channel: String(channel), is_deleted: String(select_deleted) });
        conn.query(query, async (error, results) => {
            callback(results[0].id);
        });
    },

    // 시작여부
    is_started: async (channel: String, name: String, callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        check(name, channel, (results: any, error?: any) => {
            if (error) console.log(error)
            else if (results[0]) callback(results[0].is_started);
        })
    },

    // 시작시 channel, ts 저장
    log: async (channel: String, ts: String, vote_id: String) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'log', {channel: String(channel), ts: String(ts), vote_id: String(vote_id)})
        conn.query(query);
    },

    // 서버 재실행 시 진행중인 투표 초기화
    init: async () => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'init');
        conn.query(query);
    },

    // 로그 responce
    log_get: async (callback: Function) => {
        mybatisMapper.createMapper(['src/query/vote.xml']);
        let query = mybatisMapper.getStatement('vote', 'log_get');
        conn.query(query, async function (error, results) {
            if (error) {
                console.log(error);
            } else {
                callback(results);
            }
        });
    }
}