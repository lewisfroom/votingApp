'use strict';

module.exports = function(app, db){
    app.route("/poll/:id")
        .get(function(req,res){
            res.sendFile(process.cwd() + '/public/index.html');
        });
    app.route("/add")
        .get(function(req,res){
           res.sendFile(process.cwd() + '/public/index.html'); 
        });
    var pollsCollection = db.collection("polls");    
    app.route("/api/add")
        .post(function(req,res){
            // {question: "this is a question", options: [{option: "This is an option", score: 2}{option: "this is an option 2", score: 0}{option: "this is an option3", score: 7}]}
            res.set("Content-Type", "application/json");
            console.log("Received new poll: " + JSON.stringify({question: req.body.question, options: req.body.options}));
            var optionsArray = [];
            for(var i = 0; i < req.body.options.split("\n").length; i++){
                optionsArray.push({option: req.body.options.split("\n")[i], score: 0});
            }
            var countersCollection = db.collection("counters");
                countersCollection.findAndModify({ _id: "pollid" },[], { $inc: { seq: 1 } }, {new: true}, function(err, doc){
                    if(err) throw err;
                    var newSeq = doc.value.seq;
                    pollsCollection.insert({"_id": newSeq, "question": req.body.question, options: optionsArray}, function(err,data){
                      if(err) throw err;
                      // data.ops[0] for the inserted entry. 
                      res.send(data.ops[0]._id.toString());
                      console.log("Sent new poll ID: " + data.ops[0]._id.toString());
                    });
                    
                });
        });
    app.route("/api/update")
        .post(function(req,res){
           res.set("Content-Type", "application/json");
           // poll id , option 
           pollsCollection.update({"_id": parseInt(req.body.pollid), "options.option": req.body.option}, {$inc: {"options.$.score": 1}}, function(err, doc){
              if(err) throw err;
              if(doc.result.nModified == 1){
                  console.log("Updated poll id " + req.body.pollid + " with option \"" + req.body.option + "\"");
              } else {
                  console.log("Attempted to update poll id " + req.body.pollid + " with option \"" + req.body.option + "\" and failed");
              }
              res.json(doc);
           });
        });
    app.route("/api/get/:ID")
        .get(function(req,res){
            res.set("Content-Type", "application/json");
            pollsCollection.find({"_id": parseInt(req.params.ID)}).toArray(function(err, poll) {
                 if(err) throw err;
                 if(!poll.length){
                     console.log("[!] Request for poll that doesnt exist:" + req.params.ID);
                     res.json({"error": "undefined"});
                 } else {
                    console.log("Get request for poll ID: " + req.params.ID);
                    res.json(poll[0]);
                 }
             });
        });
    app.route("/api/getLength")
        .get(function(req,res){
            res.set("Content-Type", "application/json");
            pollsCollection.find().toArray(function(err,polls){
                if(err) throw err;
                console.log("Get request for length of database")
                res.json({dbLength : polls.length});
            });
        });
};