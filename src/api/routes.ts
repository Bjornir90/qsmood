import express, { json, response } from 'express'
import Unbounded from '@unbounded/unbounded'
import fauna from 'faunadb'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config();

//Environment variable type declaration, required by typescript
declare var process: { env: {[key: string]: string;} };

interface DatabaseElement {
    date: string;
    [key: string]: DatabaseElementContent;
}

type DatabaseElementContent = number | string | string[];

const db = new fauna.Client({secret: process.env.DB_SECRET});
const q = fauna.query;

const router = express.Router();


//Apply to every routes in /api
router.use((req, res, next) => {

    console.log("Received connection on "+req.path);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');

    if(req.path === "/token" || req.path === "/token/" || req.method === "OPTIONS"){//Accepts requests even without a token
        next();
        return;
    }

    if(process.env.NODE_ENV === "dev"){
        next();
        return;
    }

    let authHeader = req.headers.authorization;

    if(authHeader){
        try{
            jwt.verify(authHeader.split(' ')[1], process.env.API_SECRET);
            next();
        } catch (err) {
            console.log("Refused connection, token invalid");
            res.status(403).json({'error': err});
            return;
        }
    } else {
        console.log("Refused connection, no token present in request");
        res.status(403).json({'error': 'Missing authentication token'});
    }

})

router.get("/test", (req, res) => {
    res.send("<h1>Test succesful</h1>");
})

router.get("/happiness/last/:nbOfDays", (req, res) => {
    let nbOfDaysToRetrieve: number = parseInt(req.params.nbOfDays);

    
})

router.post("/token", (req, res) => {
    let pass = req.body.password;
    let username = req.body.username;

    if(username !== process.env.API_USERNAME || pass !== process.env.API_PASSWORD){
        res.status(403).json({"error": "Wrong login information"});
        return;
    }

    let token = jwt.sign({'access': 'granted'}, process.env.API_SECRET, {expiresIn: 60 * 60});// Expires in 1 hour

    res.status(200).json({'token': token});
})
/*
router.post("/days/delete/:id", (req, res) => {
    let id = req.params.id;

    let result = db.delete().match({id : id}).send();

    console.log("Delete one item");

    result.then((d: any) => res.status(200).json({"message": "success", "id": id}), (e: any) => res.status(500).json(e));
})
*/

router.get("/days/:date", (req, res) => {
    let date = req.params.date;
    
    if(!matchDate(date)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    db.query(q.Get(q.Match(q.Index("days_from_date_desc"), date))).then((response: any) => {
        res.status(200).json(response.data);
    }, (err: any) => {
        res.status(500).json(err);
    })
})


router.patch("/days/:date", (req, res) => {
    let date = req.params.date;
    let body = req.body;
    body["date"] = date;

    if(!matchDate(date)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    let newDocument = {data: body};

    db.query(q.Get(q.Match(q.Index("days_from_date_desc"), date))).then((response: any) => {//Document found

        db.query(q.Update(response.ref, newDocument)).then((updateResponse: any) => {
            res.status(200).json(response);
        }, (updateError: any) => {
            res.status(500).json(updateError);
        });

    }, (err: any) => {

        if(err.requestResult.statusCode === 404){//Document does not exist
            db.query(q.Create(q.Collection("days"), newDocument)).then((response: any) => {
                res.status(201).json(response);
            }, (error: any) => {
                res.status(500).json(error);
            })
        } else {//Regular error
            res.status(500).json(err);
        }

    });

})


router.get("/days/range/:startDate/:endDate", (req, res) => {
    let startDate = req.params.startDate, endDate = req.params.endDate;

    if(!matchDate(startDate) || !matchDate(endDate)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    if(startDate >= endDate) {
        res.status(400).json({"error": "Start date must be before end date"});
        return;
    }
    
    //Map to get data instead of just refs
    //Filter to get only values in the range
    db.query(q.Map(
        q.Paginate(
            q.Filter(
                q.Match(q.Index("sort_date_desc")), 
                q.Lambda(['date', 'ref'], 
                    q.And(q.GTE(endDate, q.Var('date'), startDate))
            ))),
        q.Lambda(['date', 'ref'], q.Get(q.Var('ref')))
    )).then((response: any) => {
        let data = extractData(response);
        res.status(200).json(data);
    }, (error: any) => res.status(500).json(error));
})

router.get("/days/last/:n", (req, res) => {
    let numberOfItems: number = parseInt(req.params.n);

    db.query(q.Map(
        q.Paginate(q.Match(q.Index("sort_date_desc")), {size: numberOfItems}), 
        q.Lambda(['x', 'ref'], q.Get(q.Var('ref')))
    ))
    .then((response: any) => {
        let data = extractData(response);
        res.status(200).json(data);
    }, (err: any) => res.status(500).json(err));
})

function extractData(toExtract: any): any{
    return toExtract.data.map((x: any) => x.data);
}

function matchDate(toTest: string): boolean{
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.exec(toTest) !== null;
}

export default router;