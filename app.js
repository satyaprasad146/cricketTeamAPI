const express = require("express");
const app = express();
app.use(express.json());
module.exports = express;
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(5032, () => {
      console.log("Server running");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

let convertSnakeToCamel4 = (list) => {
  let newList = [];
  for (let eachObject of list) {
    let { player_id, player_name, jersey_number, role } = eachObject;
    let newObject = {
      playerId: player_id,
      playerName: player_name,
      jerseyNumber: jersey_number,
      role: role,
    };
    newList.push(newObject);
  }
  return newList;
};

// API 1
app.get("/players/", async (request, response) => {
  try {
    let query = `SELECT * FROM cricket_team`;
    let array = await db.all(query);
    let CamelArray = convertSnakeToCamel4(array);
    response.send(CamelArray);
  } catch (e) {
    console.log(e.message);
  }
});

//API 2
app.post("/players/", async (request, response) => {
  try {
    let newPlayer = request.body;
    let { playerName, jerseyNumber, role } = newPlayer;
    let postquery = `INSERT INTO cricket_team(player_name, jersey_number, role)
                VALUES ("${playerName}","${jerseyNumber}","${role}")`;
    let playerResponse = await db.run(postquery);
    response.send("Player Added To Team");
  } catch (e) {
    console.log(`somethingwrong ${e.message}`);
  }
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let query = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
    let data = await db.get(query);
    let newObject = {
      playerId: data.player_id,
      playerName: data.player_name,
      jerseyNumber: data.jersey_number,
      role: data.role,
    };
    response.send(newObject);
  } catch (e) {
    console.log(e.message);
  }
});

//API4
app.put("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let updatePlayerDetails = request.body;
    let { playerName, jerseyNumber, role } = updatePlayerDetails;
    let updateQuery = `UPDATE
                             cricket_team
                        SET 
                            player_name ="${playerName}",
                            jersey_number="${jerseyNumber}",
                            role ="${role}"
                        WHERE 
                            player_id = "${playerId}"`;
    let data = await db.run(updateQuery);
    let newObject = {
      playerName: data.player_name,
      jerseyNumber: data.jersey_number,
      role: data.role,
    };
    response.send("Player Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

//API 5
app.delete("/players/:playerId/", async (request, response) => {
  try {
    let { playerId } = request.params;
    let deleteQuery = `DELETE FROM cricket_team
                         WHERE player_id = "${playerId}"`;
    await db.run(deleteQuery);
    response.send("Player Removed");
  } catch (e) {
    console.log(e.message);
  }
});
