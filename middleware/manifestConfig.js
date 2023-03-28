const setConfig = async ( req, res, next ) => {

    req.app.locals.theme_color = '#F48226';
    req.app.locals.background_color = '#FFFFFF';
    req.app.locals.short_name = 'WFUT';
    req.app.locals.manifest_name = 'WFUT';
    req.app.locals.description = "Womens' football tracking app";

    next();
}

export default setConfig;