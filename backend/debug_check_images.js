const db = require('./config/db');

db.serialize(() => {
    const packages = [
        'Dubai Luxury Escape',
        'Aloha Hawaii',
        'Vancouver Nature',
        'Marrakech Souks'
    ];
    
    console.log("Checking image URLs for specific packages:");
    
    const names = packages.map(p => `'${p}'`).join(',');
    db.all(`SELECT name, destination, image_url FROM travel_packages WHERE name IN (${names})`, [], (err, rows) => {
        if (err) console.error(err);
        rows.forEach(row => {
            console.log(`\nPackage: ${row.name}`);
            console.log(`Destination: ${row.destination}`);
            console.log(`URL: ${row.image_url}`);
        });
    });
});
