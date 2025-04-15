import mysql from "mysql2/promise";

const pool = mysql.createPool({
    port: 20008,
    host: '200.129.130.149',
    user: 'petsworld',
    password: '12345678',
    database: 'petsworld_db'
})