(<any>window).eval = global.eval = function () {
    throw new Error('This app does not support \'eval\'.');
};
