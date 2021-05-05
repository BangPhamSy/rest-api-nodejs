
import { Route } from '@core/interfaces';
import express from  'express';
import mongoose from 'mongoose';
import hpp from 'hpp';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { Logger } from '@core/utils';
import {errorMiddleware} from '@core/middleware';

class App {
    public app: express.Application;
    public port: string | number;
    public production: boolean;
    /**
     *
     */
    constructor(routes: Route[]) {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.production = process.env.NODE_ENV == 'production' ? true : false;


        this.initializeRoutes(routes);
        this.initializeMiddleware();
        this.connectToDatabase();
    }

    private initializeRoutes(routes: Route[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    private initializeMiddleware() {
        if(this.production) {
            this.app.use(hpp());
            this.app.use(helmet());
            this.app.use(morgan('combined'));
            this.app.use(cors({origin: 'your.domain.com',  credentials: true}))
        } else {
            this.app.use(morgan('dev'));
            this.app.use(cors({origin:true,credentials:true}))
        }
        this.app.use(errorMiddleware)
    }

    public listen() {
       this.app.listen(this.port, () => {
        Logger.info(`Server is listening on port ${this.port}`)
       }) 
    }

    private connectToDatabase() {
        const connectionString = process.env.MONGODB_URI;
        if(!connectionString) {
            Logger.error('Connection string is invalid');
            return;
        }
        mongoose.connect(connectionString,{useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true})
        .catch((reason) => {
            Logger.error(reason)
        });
        Logger.info('Database connected...');
    }
}
export default App;