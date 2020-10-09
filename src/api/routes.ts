import express from 'express'
import Unbounded from '@unbounded/unbounded'
import dotenv from 'dotenv'

if(process.env.NODE_ENV === 'development'){
    dotenv.config();
}

let dbClient = new Unbounded('aws-us-est-2', 'celestincollin@gmail.com', process.env.DB_PASS);

const router = express.Router();

router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
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

    //TODO retrieve document in DB
    res.sendStatus(200);
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
    
    //TODO retrieve documents in DB
    res.sendStatus(200);
})

function matchDate(toTest: string): boolean{
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.exec(toTest) !== null;
}

export default router;