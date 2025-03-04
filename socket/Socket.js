const Team = require("../model/Team");
let cardCounts = [0, 0, 0, 0];

let level2Active = false;

const formatTime12Hour = (date) => {
  const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const setUpSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("Admin connected:", socket.id);

    try {
      // Fetch initial data only once and emit
      const teams = await Team.find({});
      const firstLevelTeams = teams.filter(team => team.firstLevelSubmitted);
      const secondLevelTeams = teams.filter(team => team.secondLevelSubmitted);

      socket.emit("update_teams", teams);
      socket.emit("update_firstlevel", firstLevelTeams);
      socket.emit("update_secondlevel", secondLevelTeams);
      socket.emit("update_click_counts", cardCounts);
      socket.emit("toggle_level2", level2Active);
      
      
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }

    // Handle card clicks
    socket.on("card_clicked", async ({ teamId, cardIndex }) => {
      cardCounts[cardIndex] += 1;
      io.emit("update_click_counts", cardCounts);

      try {
        await Team.findOneAndUpdate({ teamId }, { selectedCard: cardIndex });
        console.log(`Team ${teamId} selected card ${cardIndex}`);
      } catch (error) {
        console.error("Error updating selection:", error);
      }
    });

    // Handle card reveal
    socket.on("reveal_card", async ({ statement }) => {
      try {
        await Team.updateMany({}, { $set: { revealedCard: statement } });
        io.emit("card_revealed", { statement });
        console.log(`Statement: ${statement} revealed!`);
      } catch (error) {
        console.error("Error updating revealed card:", error);
      }
    });

    // Handle reset revealed card
    socket.on("reset_revealed_card", async () => {
      try {
        await Team.updateMany({}, { $set: { revealedCard: null } });
        io.emit("revealed_card_reset");
        console.log("Revealed card has been reset.");
      } catch (error) {
        console.error("Error resetting revealed card:", error);
      }
    });


    

  socket.on("toggle_level2", (status) => {
    level2Active = status;
    console.log("STATUS FOR SHOW CONTENT IS:",status);
    io.emit("toggle_level2", level2Active);
  });

    socket.on("start_level", async ({ startTime }) => {
      try {
        // const formattedTime = formatTime12Hour(new Date(startTime));
        await Team.updateMany({}, { startedTime: startTime });

        const updatedTeams = await Team.find();
        // console.log("updated teams are:",updatedTeams);

        io.emit("start_level", { startTime });
        io.emit("update_secondlevel", updatedTeams);
        io.emit("level_start_time", startTime);

        console.log(`Level started at: ${startTime}`);
      } catch (error) {
        console.error("Error updating start time:", error);
      }
    });




    socket.on("disconnect", () => {
      console.log("Admin disconnected:", socket.id);
    });
  });
};

module.exports = { setUpSocket };
