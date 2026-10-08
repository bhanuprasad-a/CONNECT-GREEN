const respondWithApiError = (res, error, operation) => {
    const isDuplicate = error?.code === 11000;
    const isInvalidInput = ['ValidationError', 'CastError', 'StrictModeError'].includes(error?.name);
    const status = isDuplicate ? 409 : isInvalidInput ? 400 : 500;
    const message = isDuplicate
        ? 'A record with these details already exists.'
        : isInvalidInput
            ? 'Invalid request data.'
            : 'An internal error occurred.';

    console.error(JSON.stringify({
        level: 'error',
        operation,
        errorName: error?.name || 'UnknownError',
        errorCode: error?.code,
    }));

    return res.status(status).json({ message });
};

module.exports = { respondWithApiError };