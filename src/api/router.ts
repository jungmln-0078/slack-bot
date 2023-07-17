import express, {Request, Response} from 'express';
import web from '../../bot';
import CONFIG from "../../config.json";
import { Database } from '../database/db';
const router = express.Router();

//https://slack.com/oauth/v2/authorize?client_id=555955492725.2156444349635&scope=channels:history+users:read+users:read.email
router.get('/oauth', async (req:Request, res:Response) => {
    let code = String(req.query.code);
    try {
        let oauth = await web.oauth.v2.access({'client_id':CONFIG.CLIENT_ID, 'client_secret':CONFIG.CLIENT_SECRET, 'code':code, 'redirect_uri': 'http://3.36.2.100:5000/oauth', 'http_verb':"GET"});
        res.send(JSON.stringify(oauth));
        res.end();
    } catch (error) {
        res.send(JSON.stringify(error));
        res.end();
    }
});

router.get('/bot/calls', async (req:Request, res:Response) => {
    let token = req.headers['x-access-token'];
    if (token === CONFIG.SLACK_TOKEN) {
        Database.log.get((results: any) => {
            res.send(results);
            res.end();
        });
    } else {
        res.send({ok: false, error: 'Invaild token'});
        res.end();
    }

});

router.get('/bot/vote', async (req: Request, res: Response) => {
    let token = req.headers['x-access-token'];
    if (token === CONFIG.SLACK_TOKEN) {
        Database.vote.log_get((results: any) => {
            res.send(results);
            res.end();
        });
    } else {
        res.send({ ok: false, error: 'Invaild token' });
        res.end();
    }
});

export = router;