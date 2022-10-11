const indexR = require("./index");
const usersR = require("./users");
const clothesR = require("./clothes");

exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/clothes",clothesR);
}