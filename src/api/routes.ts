import express, { json, response } from 'express'
import fauna from 'faunadb'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import https from "https"

dotenv.config();

//Environment variable type declaration, required by typescript
declare var process: { env: {[key: string]: string;} };

interface DatabaseElement {
    date: string;
    [key: string]: DatabaseElementContent;
}

interface TagCategory {
    type: string;
    entries: string[];
}

interface PixelDatabaseElement {
    date: string,
    moodscore: string,
    moodtags: string[],
    comment: string
}

interface PixelDatabaseRequest {
    data: PixelDatabaseElement
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
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");

    if(req.path === "/token" || req.path === "/token/" || req.method === "OPTIONS"){//Accepts requests even without a token
        next();
        return;
    }

    if(process.env.NODE_ENV === "development"){
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

router.delete("/days/:date", (req, res) => {
    let date = req.params.date;

    db.query(
        q.Get(q.Match(q.Index("days_ref_from_date"), date))
    ).then((d: any) => {
        db.query(q.Delete(d.ref)).then((deleteResponse: any) => {
            res.status(200).json(deleteResponse);
        }, (err: any) => {
            res.status(500).json(err);
        })
    }, 
    (e: any) => res.status(500).json(e));
})


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


    if(process.env.NODE_ENV !== "development") {
        const snitchReq = https.request({
            hostname: "nosnch.in",
            port: 443,
            path: "/c9cb8a5469",
            method: "GET"
        });
        snitchReq.end();
    }

    let newDocument = {data: body};

    createOrUpdateDay(newDocument).then((success) => {
        res.sendStatus(200);
    }, (error) => {
        res.sendStatus(500);
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
                q.Match(q.Index("sort_date_asc")), 
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

router.post("/pixel", (req, res) => {
    const body = req.body;

    if(!body){
        res.status(400).json({"error": "No file uploaded"});
    }

    let succesful = true;

    body.forEach((o: any) => {

        let entry = o.entries[0];

        let element: PixelDatabaseElement = {
            date: o.date,
            moodscore: entry.value,
            moodtags: new Array<string>(),
            comment: entry.notes
        };

        entry.tags.forEach((tagCategory: TagCategory) => {
            element.moodtags.push.apply(element.moodtags, tagCategory.entries);
        });

        createOrUpdateDay({data: element}).then((success) => {
        }, (error) => {
            succesful = false;
        })

    });

    if(succesful)
            res.sendStatus(200);
        else 
            res.sendStatus(500);
})

function extractData(toExtract: any): any{
    return toExtract.data.map((x: any) => x.data);
}

function matchDate(toTest: string): boolean{
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.exec(toTest) !== null;
}


function createOrUpdateDay(day: PixelDatabaseRequest): Promise<object>{
    if(day.data.date == null){
        console.log("Missing date in new day, skipping...");
        return new Promise<object>((resolve, reject) => {reject("Day is missing critical data")});
    }

    return db.query(q.Get(q.Match(q.Index("days_from_date_desc"), day.data.date))).then((response: any) => {//Document found

        return db.query(q.Update(response.ref, day));

    }, (err: any) => {

        if(err.requestResult.statusCode === 404){//Document does not exist
            return  db.query(q.Create(q.Collection("days"), day));
        } else {//Regular error
            return new Promise<object>((resolve, reject) => {reject(err)});
        }

    });
}

export default router;