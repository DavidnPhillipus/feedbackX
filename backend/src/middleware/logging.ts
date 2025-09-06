import { Request, Response, NextFunction } from 'express';

const logRequest = (req: Request, res: Response, next: NextFunction) => {
    //console.log(`request to ${req.path}.`);
    next();
};

export default { logRequest };
