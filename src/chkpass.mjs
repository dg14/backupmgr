import crypto from 'crypto';
(() => {
    let salt = "avkacxoaweoiaowei";
    let password = "blablabla";
    const genHash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex')
    console.log(genHash);

    const genHash2 = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex')
    console.log(genHash2);


})();