const locketRouter = require("./locket.route.js");
const collabRouter = require("./collab.route.js");

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.json({ message: "🚀 Server is running!" });
  });

  app.use("/locket", locketRouter);
  app.use("/api/collab", collabRouter);
};
