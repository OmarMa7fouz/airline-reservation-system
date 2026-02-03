const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./airline.db');

db.serialize(() => {
  db.all("SELECT * FROM Passenger", (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
  });
});

db.close();
