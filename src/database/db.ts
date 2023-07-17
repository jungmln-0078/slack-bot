import mysql from 'mysql';
import RANDOM from './db_rand';
import VOTE from './db_vote';
import LOG from './db_log';
import CUSTOM from './db_custom';

const conn = mysql.createPool({
    host: '3.36.2.100', 
    user:'root', 
    password: '!mydb@#0078',
    database: 'bot',
    multipleStatements: true,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
});

const Database = {
    random: RANDOM,
    vote: VOTE,
    log: LOG,
    custom: CUSTOM
}

export { Database, conn };