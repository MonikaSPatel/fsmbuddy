import mongoose from "mongoose";
mongoose.Promise = global.Promise;
mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(
    process.env.DB_HOST ||
      "mongodb+srv://mahidaparth7:nul46l9hYVmDLkqb@cluster0-xrrcw.mongodb.net/share-ads?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });
