import express from 'express'

const router = express.Router();

router.get("/test", (req, res) => {
    res.send("<h1>Test succesful</h1>");
})

router.get("/day/:date", (req, res) => {
    let date = req.params.date;
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    if(regex.exec(date) === null){
        res.setHeader('Content-Type', 'application/json');
        res.status(400).json({"error": "Date is not properly formatted"});
        return;
    }

    //TODO retrieve document in DB
    res.sendStatus(200);
})

export default router;