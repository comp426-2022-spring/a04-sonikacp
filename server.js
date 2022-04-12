/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

 function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
  }
  
  // console.log(coinFlip())
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
function coinFlips(flips) {
    const results = [];
    for (let i = 0; i < flips; i++) {
      results.push(coinFlip());
    }
    return results;
  }
  // console.log(coinFlips(10))
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
  
function countFlips(array) {
    let num_heads = 0;
    let num_tails = 0;
  
    for (let i = 0; i < array.length; i++) {
      if (array[i] === 'heads') {
        num_heads++;
      } else {
        num_tails++;
      }
    }
    let count = {heads: num_heads, tails: num_tails};
    return count;
  
  }
  // console.log(countFlips(coinFlips(10)))
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
 function flipACoin(call) {
    let flip = coinFlip();
    let result;
    if (call == flip) {
      result = "win";
    } else {
      result = "lose";
    }
    let output = {call: call, flip: flip, result: result};
    return output;
  }


// Require Express.js
const express = require('express')
const app = express()
const fs = require('fs')

// Require database script file
const db = require('./database.js')

// allow express to read urlencoded and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Require minimist module and create port
const args = require('minimist')(process.argv.slice(2))
args['port', 'debug', 'log', 'help']
// if (args.port == undefined) {
//   args.port = 5000
// }
const port = args.port || process.env.PORT || 5555;
// const help = args.help
// const debug = args.debug
// const log = args.log
// var HTTP_PORT = args.port;

// print help message if command line is help
if (args.help == true) {
  console.log (`server.js [options]
    
    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
    
    --debug	If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    
    --log	If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    
    --help	Return this message and exit.`
  )
  process.exit(0)
}


// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});


// if log is true, additional middleware, write to file
if (args.log == true) {
    const morgan = require('morgan')
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
    app.use(morgan('combined', { stream: accessLog }))
}

app.use((req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
}

// middleware
  const stmt = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, 
    method, url, protocol, httpversion, secure, status, referer, useragent) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)

  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time,
    logdata.method, logdata.url, logdata.protocol,
    logdata.httpversion, logdata.secure, logdata.status,
    logdata.referer, logdata.useragent)
  next()
})

// **endpoints** //

app.get('/app/', (req, res) => {
  // Respond with status 200
    res.statusCode = 200;
  // Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
  });


// Endpoint /app/flip/ that returns JSON {"flip":"heads"} or {"flip":"tails"} corresponding to the results of the random coin flip.
app.get('/app/flip/', (req, res) => {
    var flip = coinFlip();
    res.status(200).json({'flip' : flip})
});

// Endpoint /app/flips/:number that returns JSON including an array of the raw random flips and a summary. Example below.
app.get('/app/flips/:number', (req, res) => {
	  var raw_flips = coinFlips(req.params.number);
    var flips_summary = countFlips(raw_flips);
    res.status(200).json({'raw' : raw_flips, 'summary' : flips_summary})
});

// Endpoint /app/flip/call/heads that returns the result of a random flip match against heads as JSON.
app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin('heads'));
});

// Endpoint /app/flip/call/tails that returns the result of a random flip match against tails as JSON.
app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin('tails'));
});

// ALL endpoints should return HTTP headers including a status code and the appropriate content type for the response.
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
    res.type("text/plain")
});

if (args.debug == true) {
    // Create a new endpoint /app/log/access that returns all records in the accesslog table in your database log.db
    app.get("/app/log/access", (req, res) => {
      try {
          const stmt = db.prepare('SELECT * FROM accesslogs').all()
          res.status(200).json(stmt)
      } catch {
          console.error(e)
      }
    });

    // Create an endpoint /app/error that returns an error in the response
    app.get('/app/error', (req, res) => {
        res.status(500);
        throw new Error('Error test completed successfully.')
    });
}

