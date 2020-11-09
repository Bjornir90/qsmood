import app from './src/api/index.js'
import servestatic from 'serve-static'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config();

if(process.env.NODE_ENV === 'production'){
    app.use(servestatic(path.join(path.resolve(), 'dist')));
}


app.listen(app.get('port'), () => {
    console.log("API server started on "+app.get('port')+" on env "+process.env.NODE_ENV);
});