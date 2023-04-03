const setConfig = async ( req, res, next ) => {

    req.app.locals.theme_color = '#0fffc5';
    req.app.locals.background_color = '#0fffc5';
    req.app.locals.short_name = 'WFUT';
    req.app.locals.manifest_name = 'WFUT';
    req.app.locals.description = "Womens' football tracking app";

    next();
}

export default setConfig;