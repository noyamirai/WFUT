const hasSession = (req, res, next) => {

    // check if cookies supported/allowed
    if (req.headers.cookie) {
        const userCookieId = req.cookies['wfutsession'];
        const userSessionId = req.session.session_id;
        
        if (!userCookieId) {
            console.log('no cookie id yet -> refresh');
            return res.redirect('/');
        }
                    
        if (!userSessionId) {
            console.log('cookie id set');
            req.session.session_id = userCookieId;
        }

        req.session.cookie_allowed = true;

        next();
        return;


    } else {
        req.session.cookie_allowed = false;
    }

    next();
    return;
}

export default { hasSession };