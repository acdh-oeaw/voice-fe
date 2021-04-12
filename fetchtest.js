const getImprintHTML = require('./src/functions/fetchImprint');

(async () => {
    try {
        var text = await getImprintHTML();
        console.log(text);
    } catch (e) {
        console.log(e)
    }
})();