const Team = require("../model/Team");


const register = async (req, res) => {
  try {
    const { team } = req.body;

    // 🔹 Validate the input: Must be an array with exactly 4 members
    if (!Array.isArray(team) || team.length !== 4) {
      return res.status(400).json({ message: "A team must have exactly 4 members!" });
    }

    // 🔹 Validate each member's structure and `teckziteId` format
    for (const member of team) {
      if (!member.name || !member.teckziteId) {
        return res.status(400).json({ message: "Each member must have a name and teckziteId!" });
      }
      if (!/^TZK25\d{4}$/.test(member.teckziteId)) {
        return res.status(400).json({ message: `${member.teckziteId} is not a valid Teckzite ID!` });
      }
    }

    // 🔹 Find the latest teamNumber in the database
    const lastTeam = await Team.findOne().sort({ teamNumber: -1 });

    // 🔹 Calculate the next team number
    const nextTeamNumber = lastTeam ? lastTeam.teamNumber + 1 : 1;

    // req.io.emit("new_team_registered", team);
    // 🔹 Create a new team with the next team number
    const newTeam = new Team({
      teamNumber: nextTeamNumber,
      members: team, // Directly storing the validated array
    });

    // 🔹 Save to MongoDB
    await newTeam.save();


  
    req.io.emit("update_teams", await Team.find()); 

    res.status(201).json({ message: "Team added successfully", team: newTeam,teamId: newTeam._id});
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const compareLogicGates = async (req, res) => {
  try {
      const { logicGateStatements,matchedPairs } = req.body;
      console.log(logicGateStatements,matchedPairs)

      if (!Array.isArray(logicGateStatements) || !Array.isArray(matchedPairs)) {
          return res.status(400).json({ message: "Invalid input format!" });
      }

      let correctCount = 0;
      let incorrectPairs = [];

      matchedPairs.forEach(userPair => {
          const correctPair = logicGateStatements.find(ans => ans.gate === userPair.gate);
          if (correctPair && correctPair.statement === userPair.statement) {
              correctCount++;
          } else {
              incorrectPairs.push(userPair);
          }
      });

      res.status(200).json({ correctCount, incorrectPairs });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const submitFirstLevel = async (req, res) => {
  try {
      const { teamId } = req.body;  // Receive _id from request body
      if (!teamId) return res.status(400).json({ message: "Team ID is required" });

      // Find the team by _id and update firstLevelSubmitted
      const team = await Team.findByIdAndUpdate(
          teamId, 
          { firstLevelSubmitted: true }, 
          { new: true }
      );

      if (!team) return res.status(404).json({ message: "Team not found" });

      // Emit event using Socket.io
      req.io.emit("update_firstlevel", await Team.find({ firstLevelSubmitted: true }));

      res.status(200).json({ message: "First level submitted", team });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const submitSecondLevel = async (req, res) => {
  try {
      const { teamId,finishTime } = req.body;  // Receive _id from request body
      if (!teamId) return res.status(400).json({ message: "Team ID is required" });

      const team = await Team.findByIdAndUpdate(
        teamId, 
        { secondLevelSubmitted: true,finishTime:finishTime}, 
        { new: true }
    );

    console.log("team is",team);
    


      if (!team) return res.status(404).json({ message: "Team not found" });

      req.io.emit("update_secondlevel", await Team.find({ secondLevelSubmitted: true }),finishTime);
      res.status(200).json({ message: "Second level submitted", team });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getSelection = async(req,res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ selectedCard: team.selectedCard ,firstLevelSubmitted:team.firstLevelSubmitted});
  } catch (error) {
    res.status(500).json({ message: "Error fetching selection", error });
  }
}

const saveSelection = async(req,res) => {
  const { teamId, selectedCard } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.selectedCard = selectedCard;
    await team.save();

    res.json({ message: "Selection saved", selectedCard });
  } catch (error) {
    res.status(500).json({ message: "Error saving selection", error });
  }
}

const getStats = async (req, res) => {
  try {
      // Fetch the total number of registered teams
      const totalTeams = await Team.countDocuments();

      // Fetch the teams that have submitted for the second level
      const secondLevelTeams = await Team.find({ secondLevelSubmitted: true });

      // Fetch the counts of selected cards
      let cardCounts = [0, 0, 0, 0];

      const selectedCards = await Team.find({ selectedCard: { $ne: -1 } }, "selectedCard");

      selectedCards.forEach(team => {
          if (team.selectedCard >= 0 && team.selectedCard < 4) {
              cardCounts[team.selectedCard]++;
          }
      });

      res.json({
          totalTeams,
          secondLevelTeams: secondLevelTeams.length,
          teamsNotSubmitted: totalTeams - secondLevelTeams.length,
          cardCounts
      });

  } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};


const getRevealedCard = async(req,res) => {
  try {
    const team = await Team.findOne({}).sort({ _id: -1 })
    const revealedCard = team?.revealedCard ?? null;
    console.log("team is",team)
    console.log(revealedCard);
    res.json({ revealedCard });
  } catch (error) {
    console.error("Error fetching revealed card:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}











const registerCount = async() => {
  try {
    const count = await Team.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving count", error });
  }

}


module.exports = {
  register,getRevealedCard, registerCount,compareLogicGates,submitFirstLevel, submitSecondLevel,getSelection,saveSelection,getStats
}