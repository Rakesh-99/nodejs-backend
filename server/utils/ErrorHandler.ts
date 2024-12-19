class ErrorHandler extends Error {
    statusCode: number;
    constructor(statusCOde: number, errMessage: string) {
        super(errMessage);
        this.statusCode = statusCOde
    }
};

export default ErrorHandler;
