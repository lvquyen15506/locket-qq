const locketRouter = require("./locket.route.js");
const collabRouter = require("./collab.route.js");
const convertRouter = require("./convert.route.js");
const adminRouter = require("./admin.route.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.json({ message: "🚀 Server is running!" });
  });

  app.use("/locket", locketRouter);
  app.use("/api/collab", collabRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/v1/public", adminRouter);
  app.use("/v1/public", adminRouter); 
  app.use("/api", convertRouter);
};
