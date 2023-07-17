import fs from 'fs';
import jwt from 'jsonwebtoken';

let secret = fs.readFileSync("./src/api/private.key");

function signToken(user_id: string) {
    const token = jwt.sign({user_id: user_id}, secret, { algorithm: 'RS256' });
    return token;
}

export = {
    signToken
}
