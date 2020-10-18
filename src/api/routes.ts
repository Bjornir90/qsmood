import express from 'express'
import Unbounded from '@unbounded/unbounded'
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

let dbClient = new Unbounded('aws-us-east-2', process.env.DB_MAIL, process.env.DB_PASS);

let db = dbClient.database("qsmood");

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

router.post("/days/delete/:id", (req, res) => {
    let id = req.params.id;

    let result = db.delete().match({id : id}).send();

    console.log("Delete one item");

    result.then((d: any) => res.status(200).json({"message": "success", "id": id}), (e: any) => res.status(500).json(e));
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

        if(data.length > 0){//Record is in database : update

            console.log("Update element from patch in database");

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

            console.log("Create element from patch in database");

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

    let result = db.query().where((o: any) => true).limit(numberOfItems).send();

    console.log("Requested "+numberOfItems+" items");

    result.then((data) => res.status(200).json(data), (err) => res.status(500).json({"error": "Error !"}));
})

function matchDate(toTest: string): boolean{
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.exec(toTest) !== null;
}

export default router;