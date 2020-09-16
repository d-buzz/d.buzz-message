const fs = require('fs');
if (!fs.existsSync('./.env')){
    console.log('Created env file');
    fs.createReadStream('./.env.example').pipe(fs.createWriteStream('./.env'));
}
