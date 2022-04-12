"use strict"
// require better-sqlite3
const Database = require('better-sqlite3')

// create database in log.db
const db = new Database('log.db')

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslogs';`);
let row = stmt.get();

// check if table exists
if (row === undefined) {
    console.log('Log database appears to be empty. Log database is being created now...')

    // contains commands to initialize database
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
    // execute commands
    db.exec(sqlInit);
    console.log('New table in database')

// if database exists, log that
} else {
    console.log('Log database already exists');
}

// export as a module
module.exports = db;
