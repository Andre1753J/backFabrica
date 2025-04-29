import mysql from "mysql2/promise";

const pool = mysql.createPool({
    port: 3306,
    host: 'ss04ggwskkwc0ksgcookg48w',
    user: 'petsworld',
    password: '12345678',
    database: 'petsworld_db'
})

export default pool;