import * as spawn from 'child_process';

/** Maximizing the number of new green letters using information gain */
function maximizeGreenLetters() {
    return
}

/** Maximizing the number of new yellow letters using information gain */
function maximizeYellowLetters() {
    return
}

/** Decide which of the maximizeGreenLetters or maximizeYellowLetters to use at different stages of the game */
export function strategyDecider() {
    const { spawn } = require('child_process')
    const python = spawn('py', ['Model.py'])
    let data;

    python.stdout.on('data', (data) => {
        console.log('Pipe data from python script ...');
        console.log(`stdout: ${data}`);
        data = data
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // in close event we are sure that stream from child process is closed
    python.on('close', async (code) => {
        console.log(`childt process close all stdio with code ${code}`);
        return data 
    })
}