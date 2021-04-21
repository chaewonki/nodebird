require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorAliases: "false",
  },
  production: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "nodebird",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: "false",
    /**
      To hide query, set logging false.
     */
    logging: false,
  },
};
