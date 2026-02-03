const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./airline.db");
db.serialize(() => {
  db.all(
    "SELECT * FROM Passenger WHERE Username = 'testuser999'",
    (err, rows) => {
      if (err) {
        console.error("Error connecting/querying:", err);
      } else {
        console.log("Passenger Rows:", rows);
      }
    },
  );
});
db.close();
