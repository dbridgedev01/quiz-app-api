const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();


async function dbConnect(){
    // For connecting to the locally run MongoDB Database.
    const mongoDBURL = process.env.MONGODB_URL;
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoDBURL);
}

dbConnect();

//Schema for a primitive quiz.
const quizSchema = {
    question: String,
    choices: [],
    answer: String
};

//Schema for category segregation
const quizCategorySchema = new mongoose.Schema({
    category: String,
    quizzes: [quizSchema]
});

//Creating Collection
const Quiz = mongoose.model("Quiz", quizCategorySchema);


const app = express();

app.use(bodyParser.urlencoded({
    extended: true
  }));

//Using EJS for dynamic templating
app.set("view engine", "ejs");

const portNumber = process.env.PORT_NUMBER;

app.listen(portNumber, () => {
    console.log("Server Started.");
});

app.get('/', (req, res) => {
    res.render("home");
});

//View all quizzes
app.get("/quizzes", (req, res) => {

    Quiz.find({}, (err, docs) => {
        if(err) {
            console.log(err);
        }
        else if(docs){
            // console.log(docs);
            res.render("quizzes", {docs: docs});
        }
        else {
            res.send("No Quizzes Found.")
        }
    })
});

//View a single quiz of choice and participate
app.get("/quizzes/:category", (req,res) => {

    const categoryParam = req.params.category;
    Quiz.findOne({category: categoryParam}, (err, docs) => {
        if(err){
            console.log(err);
        }
        else{
            if(docs){
            // console.log(docs);
            res.render("quiz", {category: docs.category, quizzes: docs.quizzes})
            }
            else {
                res.send("No Quizzes Found.")
            }
        }
    })
});

//To add a quiz
app.route("/addquiz")
.get((req,res) => {
    res.render("addquiz", {quizName: ""});
})
.post((req,res) => {
    const elements = req.body;
    const category = elements.quizName;
    const question = elements.question;
    const choices = [elements.choice1, elements.choice2, elements.choice3, elements.choice4];
    const answer = elements.answer;

    const singleQuiz = {
        question: question,
        choices: choices,
        answer: answer
    };

    //Trying to see if a category already exists, if not create one.
    Quiz.findOne({category: category}, (err, docs) => {
        if(err){
            console.log(err);
        }
        else if(!docs){
            const quiz = new Quiz({
                category: category,
                quizzes: singleQuiz
            });
            quiz.save();
            console.log("Created and Added.");
            res.redirect("/quizzes/"+category);
        }
        else {
            docs.quizzes.push(singleQuiz);
            docs.save();
            console.log("Added.");
            res.redirect("/quizzes/"+category);
        }
    })
});

//Adding quiz directly from view quiz
app.post("/quiz", (req, res) => {
    const quizName = req.body.addBtn;
    res.render("addquiz", {quizName: quizName});
})