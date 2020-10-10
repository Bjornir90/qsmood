import express from 'express'
import Unbounded from '@unbounded/unbounded'
import dotenv from 'dotenv'

dotenv.config();

let dbClient = new Unbounded('aws-us-east-2', 'celestincollin@gmail.com', process.env.DB_PASS);

let db = dbClient.database("qsmood");

const router = express.Router();

router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

router.get("/test", (req, res) => {
    res.send("<h1>Test succesful</h1>");
})

router.get("/day/:date", (req, res) => {
    let date = req.params.date;
    
    if(!matchDate(date)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    let result = db.match({date: date});

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json(err));
})

router.get("/range/:startDate/:endDate", (req, res) => {
    let startDate = req.params.startDate, endDate = req.params.endDate;

    if(!matchDate(startDate) || !matchDate(endDate)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    if(startDate >= endDate) {
        res.status(400).json({"error": "Start date must be before end date"});
        return;
    }
    
    let result = db.query().where((startDate: string, endDate: string, o: { date: string; }) => o.date >= startDate && o.date <= endDate).bind(startDate, endDate).send();

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json(err));
})

router.get("/last/:n", (req, res) => {
    let numberOfItems: number = parseInt(req.params.n);

    let result = db.query().where((o: any) => true).send();

    console.log("Requested "+numberOfItems+" items");

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json({"error": "Error !"}));
})

function matchDate(toTest: string): boolean{
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.exec(toTest) !== null;
}

export default router;