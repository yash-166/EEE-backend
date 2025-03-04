// const express = require("express");
// const app = express();
// const PORT = process.env.PORT || 8000;
// const teamRoutes = require('./routes/teamRoutes');

// require("dotenv").config(); 


// require("./db/conn")

// app.use(express.json());

// const cors = require("cors");
// app.use(cors({credentials:true}));




// app.use('/team',teamRoutes);



// async function startServer(){
//     try{
//         app.listen(PORT,() => {
//             console.log(`Server is running on port ${PORT}`);
//         })
//     }
//     catch(error){
//         console.log("Error while strting server is:",error);
//     }
// }

// startServer();





const express = require("express");
const http = require("http"); // Import http module
const socketIo = require("socket.io");
const {setUpSocket} = require('./socket/Socket')
const cors = require("cors");
require("dotenv").config();
const teamRoutes = require("./routes/teamRoutes");
const PORT = process.env.PORT || 8000;

require("./db/conn");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust as per your frontend URL
        methods: ["GET", "POST"]
    }
});


app.use(express.json());
app.use(cors("*"));

app.use((req, res, next) => {
    req.io = io; // Attach io instance to request
    next();
});


app.use("/team", teamRoutes);



setUpSocket(io)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
