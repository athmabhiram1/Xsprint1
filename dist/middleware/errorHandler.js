"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const responseFormatter_1 = require("../utils/responseFormatter");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json((0, responseFormatter_1.fail)(err.message));
    }
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
        });
        return res.status(400).json((0, responseFormatter_1.fail)('Validation failed'));
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                return res.status(409).json((0, responseFormatter_1.fail)('Record already exists'));
            case 'P2025':
                return res.status(404).json((0, responseFormatter_1.fail)('Record not found'));
            case 'P2003':
                return res.status(400).json((0, responseFormatter_1.fail)('Invalid reference'));
            case 'P2014':
                return res.status(400).json((0, responseFormatter_1.fail)('Cannot delete record with existing relations'));
            default:
                return res.status(400).json((0, responseFormatter_1.fail)('Database operation failed'));
        }
    }
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json((0, responseFormatter_1.fail)('Invalid data provided'));
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json((0, responseFormatter_1.fail)('Invalid authentication token'));
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json((0, responseFormatter_1.fail)('Authentication token expired'));
    }
    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Something went wrong';
    return res.status(statusCode).json((0, responseFormatter_1.fail)(message));
}
function notFoundHandler(req, res) {
    res.status(404).json((0, responseFormatter_1.fail)(`Route ${req.method} ${req.originalUrl} not found`));
}
