import { Request, Response, NextFunction } from 'express';
import z from 'zod';

export class ValidationError extends Error {
    constructor(public validationErrors: z.ZodIssue[]) {
        super('Validation Error');
        this.name = this.constructor.name;
    }
}

const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ValidationError) {
        res.status(400).json({ errors: err.validationErrors });
    }

    if (err.message === '404' || err.code === 'P2025') {
        return res.status(404).json({ error: 'resource not found' });
    }

    console.log('Error message', err.message);
    console.log('Error code', err.code);
    console.log('Error stack', err.stack);

    //res.status(500).json({ error: 'Something went wrong' });
    next(err);
};

export default { errorHandler };
