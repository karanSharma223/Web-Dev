exports.getDate = function(){
    let today = new Date();
    
    const options= {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    let day = today.toLocaleString("en-US",options);
    return day;
};

exports.getDay = function(){
    let today = new Date();
    
    const options= {
        weekday: "long",
    };
    let day = today.toLocaleString("en-US",options);
    return day;
};