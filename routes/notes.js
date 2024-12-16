const express = require('express')
const {body, validationResult } = require('express-validator');
const User = require('../models/Notes')
const router = express.Router()
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');

const validate = validations => {
  return async (req, res, next) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    }

    next();
  };
};

// route for get notes from databases
router.get('/getallnotes',fetchuser,async(req,res)=>{
   const notes = await Notes.find({user:req.user.id})
   res.json(notes)
})

// route for add note into databases
router.post('/addnotes',fetchuser, validate([
    body('title').isLength({ min: 3 }),
  body('description').isLength({ min: 6 }),
  body('tag').isLength()
]), async(req, res, next) => {
 try {
   const {title,description,tag} = req.body;
    const note = new Notes({title,description,tag,user:req.user.id})
    const notes = await note.save()
    res.json(notes)
 } catch (error) {
   console.error(error.message);
    res.status(500).send("internal server error")
 }
});


// route for updates notes 

router.put('/updatenote/:id',fetchuser,validate([
    body('title').isLength({ min: 3 }),
  body('description').isLength({ min: 6 }),
  body('tag').isLength()
]),async(req,res)=>{
  try {
    const {title,description,tag} = req.body;
    const newNote = {};
    if(title){
      newNote.title = title
    }
    if(description){
      newNote.description = description
    }
    if(newNote.tag){
      newNote.tag = tag
    }

    let note = await Notes.findById(req.params.id)
    if(!note){
      return res.status(401).send('not found')
    }
    if(note.user.toString()!==req.user.id){
       return res.status(401).send('not allowed')
    }
   note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
   note.save()
   res.json({note})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error")
  }
})

// route foe delete note 

router.delete('/deletenote/:id',fetchuser,async(req,res)=>{
  try {
    const {title,description,tag} = req.body;

    let note = await Notes.findById(req.params.id)
    if(!note){
      return res.status(401).send('not found')
    }
    if(note.user.toString()!==req.user.id){
       return res.status(401).send('not allowed')
    }
   note = await Notes.findByIdAndDelete(req.params.id)
   res.json({"success" : "note has been delete",note:note})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error")
  }
})

module.exports = router

