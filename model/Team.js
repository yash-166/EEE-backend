const mongoose = require("mongoose");

// Schema for team member details
const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teckziteId: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^TZK25\d{4}$/.test(v);
            },
            message: props => `${props.value} is not a valid Teckzite ID!`
        }
    }
});

// Schema for the team
const teamSchema = new mongoose.Schema({
    teamNumber: { type: Number, unique: true },
    members: { 
        type: [teamMemberSchema], 
        validate: {
            validator: function(v) {
                return v.length === 4;
            },
            message: "A team must have exactly 4 members."
        }
    },
    firstLevelSubmitted: { type: Boolean, default: false },
    secondLevelSubmitted: { type: Boolean, default: false },
    startedTime: { type: String, default: "" },
    finishTime: { type: String, default: "" },
    selectedCard: { type: Number, default: null },
    revealedCard: { type: String, default: null } 
});

// Create model
const Team = mongoose.model("Team", teamSchema);

module.exports = Team;

