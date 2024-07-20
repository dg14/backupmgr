const fs=require('fs');
(()=> {
    const conf=JSON.parse(fs.readFileSync(process.argv[2]));
    console.log(conf);

    
})();