const meHandler = (req: any, res: any, next: any) => {
    if (
        req.params.user_id === 'me' ||
        req.params.user_id === '@me' ||
        req.params.user_id === 'me/'
    ) {
        req.params.user_id = req.auth.id;
    }
    next();
};

export default meHandler;
