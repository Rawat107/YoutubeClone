const requestLogger = (port) => (req, res, next) => {
    res.on('finish', () => {
        console.log(`${req.method} http://localhost:${port}${req.originalUrl} -> ${res.statusCode}`)
    });
    next();
}

export default requestLogger