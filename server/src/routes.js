/** Maximizing the number of new green letters using information gain */
function maximizeGreenLetters() {
    return
}

/** Maximizing the number of new yellow letters using information gain */
function maximizeYellowLetters() {
    return
}

/** Decide which of the maximizeGreenLetters or maximizeYellowLetters to use at different stages of the game */
function strategyDecider() {

}


module.exports = () => {
    const express = require("express");
    const router = express.Router();
  
    /**** Routes ****/
    router.get('/hello', async (req, res) => {
      res.json({msg: "Hello, world!"});
    });
  
    router.get('/hello/:name', async (req, res) => {
      res.json({msg: `Hello, ${req.params.name}`});
    });

    router.get('/getData', async (req, res) => {
        const { spawn } = require('child_process')
        const python = spawn('py', ['Model.py'])
        let data;
    
        python.stdout.on('data', (data) => {
            console.log('Pipe data from python script ...');
            console.log(`stdout: ${data}`);
            data = data
            console.log("data of python script output: ", data)
        });
    
        python.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        // in close event we are sure that stream from child process is closed
        python.on('close', async (code) => {
            console.log(`childt process close all stdio with code ${code}`);
            res.json({msg: `Data from python, ${data}`});
        })
      });
  
    return router;
  }