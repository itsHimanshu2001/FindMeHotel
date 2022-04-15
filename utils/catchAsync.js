module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

//this is a wrap function which actually takes function as an argument and implemented in place of try{} catch()
//where if error has been thrown it gets caught by this and passed using next to middleware which handles errors

//this function will return a function that will catch the error and pass it to middleware using catch(next)
//and wherever app.use((err, req, res, next)=> {}) the first one is called and so on calls next ones if we used next in that also