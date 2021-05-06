import { Request,Response,NextFunction } from "express";

export default class UsersController {
    public index = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).json("Api users running...")
        } catch(error) {
            next(error);
        }
    }
}