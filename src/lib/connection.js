const mySQL = require("mysql2/promise");

const connection = async () => {
    const conn = await mySQL.createConnection({
        host: process.env.DB_HOST ?? "localhost",
        user: process.env.DB_USER ?? "root",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_NAME ?? "testdb",
    });
    return conn;
};

module.exports = connection;
