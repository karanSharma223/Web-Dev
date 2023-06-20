const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
mongoose.connect('mongodb://localhost:27017/listDB');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

const itemSchema = {
    name : String
};

const listSchema = {
    name : String,
    items : [itemSchema]
};

const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name : "Welcome to your list"
});

const item2 = new Item({
    name : "Tap on + to add items"
});

const item3 = new Item({
    name : "<-- here to delete items"
});

let defaultItems = [item1, item2, item3];

async function getItems(){
    const allItems = await Item.find({}).exec();
    return allItems;
}


app.get("/", async function(req,res){

    itemList = await getItems()
    if(itemList.length == 0){
        Item.insertMany(defaultItems);
        res.redirect("/");
    }
    
    res.render('index', {title: "Today", list: await getItems()});
});

app.get("/:customListName", async function(req,res){
    const listName = _.capitalize(req.params.customListName);
    const foundlist = await List.findOne({name : listName}).exec();
    if(!foundlist){
        const newList = new List({
            name : listName,
            items : defaultItems
        });
        newList.save();
        res.redirect("/"+ listName);
    }
    else{
        if(foundlist.items.length == 0){
            console.log("inside");
            await List.findOneAndUpdate({name: listName},{$set : {items : defaultItems}});
            res.redirect("/" + listName);
        }
        res.render('index', {title: listName, list: foundlist.items});
    }
});

app.post("/delete", async function(req,res){

    const listName = req.body.ListName;

    if(listName === "Today")
    {
        await Item.findByIdAndRemove(req.body.check);
        console.log("deleted item");
        res.redirect("/");
    }
    else 
    {
        await List.findOneAndUpdate({name: listName},{$pull :{items: {_id: req.body.check}}});
        res.redirect("/" + listName);
    }
});

app.post("/", async function(req,res){
    const itemName = req.body.listItem;
    const listName = req.body.button;
    const newItem = new Item({
        name : itemName
    });

    if(listName === "Today"){
        newItem.save() ;
        res.redirect("/");
    }
    else{
        console.log(listName);
        const foundlist = await List.findOne({name : listName}).exec();
        foundlist.items.push(newItem);
        foundlist.save()
        res.redirect("/" + listName);
    }
    
});

app.listen(3000, async function(){
    await console.log("server running on 3000");
});