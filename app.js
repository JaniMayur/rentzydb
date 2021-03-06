require("dotenv").config("env");
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const Message = require("./models/messages");
const Landlord = require("./models/landlord");

const cors = require("cors");
const port = process.env.PORT;

server = app.listen(port, console.log(`listening at ${port}`));

const io = require("socket.io")(server);

app.use(
  bodyparser.json({
    limit: "50mb",
  })
);
app.use(
  bodyparser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
  })
);
app.use(cors());
app.use("/", express.static(path.join(__dirname, "public")));

const landlordRouter = require("./routers/landlord");
const renterRouter = require("./routers/renter");
const propertyRouter = require("./routers/property");

// const userRouter = require("../backend_db/routers/user");
// const categoryRouter = require("../backend_db/routers/category");
// const blogRouter = require("../backend_db/routers/blog");
// const productRouter = require("../backend_db/routers/product");
mongoose
  .connect(process.env.MONGO, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("connected with database"))
  .catch((error) => {
    console.log(error);
  });

app.use(landlordRouter);
app.use(propertyRouter);
app.use(renterRouter);

// app.get("/", (req, res) => {
//   res.send("hello");
// });
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/chat.html");
});
io.on("connection", (socket) => {
  
  console.log(socket.id);
  
  socket.on("chatmsg", async (data) => {
    const landlord = await Landlord.findOne({ _id: data.ll });
    socket.join(data.prop);
    
    io.to(data.prop).emit("message", data.msg);

    await Message.create({
      property: data.prop,
      message: data.msg,
      landlord_id: landlord._id,
      renter_id: data.rent,
    });
    
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    
  });
});
