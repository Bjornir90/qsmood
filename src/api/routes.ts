import express from 'express'
import Unbounded from '@unbounded/unbounded'
import dotenv from 'dotenv'

dotenv.config();

interface DatabaseElement {
    date: string;
    [key: string]: DatabaseElementContent;
}

type DatabaseElementContent = number | string | string[];

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

router.get("/days/:date", (req, res) => {
    let date = req.params.date;
    
    if(!matchDate(date)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    let result = db.match({date: date});

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json(err));
})

//TODO secure user input !
router.patch("/days/:date", (req, res) => {
    let date = req.params.date;
    let body = req.body;

    if(!matchDate(date)){
        res.status(400).json({"error": "Date is not properly formatted, format is aaaa-mm-dd"});
        return;
    }

    let result = db.match({date: date});

    result.then((data) => {

        console.log("Database is responsive on patch");

        if(data.length > 0){//Record is in database : update

            console.log("Update element in database");

            db.update().match({date: date}).set((body:any, o: DatabaseElement) => {
                let newObject: DatabaseElement = o;

                for (const key in body) {
                    const element: DatabaseElementContent = body[key];
                    newObject[key] = element;
                }

                return newObject;
            }).bind(body).send()
            .then((d: DatabaseElement) => res.status(200).json(d), (err: any) => res.status(500).json(err));

        } else {//Record is not in database : create

            console.log("Create element in database");

            let newObject: DatabaseElement = {date: date};

            for (const key in body) {
                const element: DatabaseElementContent = body[key];
                newObject[key] = element;
            }

            db.add(newObject)
            .then((d: DatabaseElement) => res.status(201).json(d), (err: any) => res.status(500).json(err));

        }
        
    }, (err) => {
        res.status(500).json(err);
    })
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
    
    let result = db.query().where((startDate: string, endDate: string, o: { date: string; }) => o.date >= startDate && o.date <= endDate).bind(startDate, endDate).send();

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json(err));
})

router.get("/days/last/:n", (req, res) => {
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