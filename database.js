const Database = require('better-sqlite3')
const db = new Database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslogs';`);

let row = stmt.get();

if (row == undefined) {
    console.log('Log database appears to be empty. Log database is being created now...')

    const sqlInit = 
    `CREATE TABLE accesslog (
        id INTEGER PRIMARY KEY,
        remote_addr VARCHAR,
        remote_user VARCHAR,
        time VARCHAR, 
        method VARCHAR,
        url VARCHAR,
        protocol VARCHAR,
        http_version NUMERIC,
        secure INTEGER,
        status INTEGER,
        referer VARCHAR,
        user_agent VARCHAR
    );`
    db.exec(sqlInit);
} else {
    console.log('Log database already exists');
}
