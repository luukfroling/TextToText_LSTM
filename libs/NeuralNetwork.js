/* Luuk Fröling
*   Error 6-2-2018 Sizes do not correspond.
*   Solution: I saved an array of inputs.
*   Edit 8-12-2018: added multilayer functionality (or at least a try lets see how this goes. )
*   No biases yet. Im sorry iM too lazy TODO fix being lazy.
*   Edit 14-12-2018: Added multiple output (started to add) for text and/or sequence generation.
*   I will specifically implement text generation.
*/

class neuralNetwork {
  constructor(sizes){
    //Structure of the network.
    this.lr= 1;
    this.netconfig = sizes;
    this.input = new Matrix(sizes[0]);
    //this.hidden = new Matrix(sizes[1]);
    this.layers = new Array();
    this.weights = [];
    this.output = new Matrix(sizes[sizes.length - 1]);

    //Output length (quick fix)
    this.ol = sizes[sizes.length - 1];

    //MULTIPLE LAYER ADDITIONS:
    //Create all the layers after the first hidden layer.
    for(let i = 0; i < sizes.length; i++){
      this.layers.push(new Matrix(sizes[i]));
    }

    //this.Who = new Matrix(sizes[2], sizes[1]);
    for(let i = 0; i < this.layers.length - 1; i++){
      this.weights.push(new Matrix(sizes[i + 1], sizes[i]));
    }

    //The time components. These needs to be arrays.
    this.pInput = new Array();
    this.pHidden = new Array();
    this.pOutput = new Array();

    /* Now we need to define all the compinents of the LSTM cell.
    *  Starting off with the weights, which need to be sizes[1] (the hidden layer) as output.
    *  The input will be of sizes input + hidden as the 2 arrays will be concatinated.
    */
    this.Wf = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wf.fill(1);
    this.WfB = 1;
    this.Wi = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wg = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wo = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).


    //The 'layers' of the lstm cell. With these we calculate inside the cell.
    this.f = new Matrix(sizes[1]);
    this.i = new Matrix(sizes[1]);
    this.g = new Matrix(sizes[1]);
    this.o = new Matrix(sizes[1]);

    //The memory of the layers:
    this.pf = new Array();
    this.pi = new Array();
    this.pg = new Array();
    this.po = new Array();
    this.pc = new Array();

    /* this.c = the cell state. This is to be added to the pCellstate.
    *  this.cellinput will become the matrix which we add the previous hidden state and the input to.
    */
    this.c = new Matrix(sizes[1]);
    this.c.fill(0);
    this.cellInput = new Matrix(0);

    /* The output functions.
    *  Every spot in the array stands for an output.
    */
    this.outputFunctions = [
      function(d){
        let abc = "abcdefghijklmnopqrstuvwxyz .";
        let result;
        console.log("output = ", d, "-- with letter = " + abc[d]);
        result =  abc[d];
        return result;
      }
    ];
    this.data = undefined;

    if('webkitSpeechRecognition' in window) {
      this.rec = new webkitSpeechRecognition();
    }
  }

  /* Input is an array of input values -> [0,1,0].
  *  We want to concate the input first, and then the hidden array.
  *  Error of 6-2-2018, error definitly not in the activate function.
  */
  activate(data){
    this.input = Matrix.fromArray(data);
    this.layers[0] = Matrix.fromArray(data);
    this.cellInput = new Matrix(0);

    this.cellInput = Matrix.concatinateY(this.cellInput, this.input);
    this.cellInput = Matrix.concatinateY(this.cellInput, this.pHidden[this.pHidden.length-1]); //Add the previous hidden states which start at 0;
    this.pInput.push(this.cellInput);

    this.f = Matrix.product(this.Wf, this.cellInput); //Get the result.
    this.f.add(this.WfB);
    this.f.func(sigmoid);
    this.pf.push(this.f);

    //Checked up until here! 29/01/2018
    this.i = Matrix.product(this.Wi, this.cellInput);
    this.i.func(sigmoid);
    this.pi.push(this.i);

    //Checked and worked.
    this.g = Matrix.product(this.Wg, this.cellInput);
    this.g.func(tanH);
    this.pg.push(this.g);
    //Checked till here, worked. 2-2-2018.

    //Get the cell state:
    this.c.scale(this.f);
    this.c.add(Matrix.scale(this.i, this.g));
    this.pc.push(this.c)

    //And finally the hidden state:
    this.o = Matrix.product(this.Wo, this.cellInput);
    this.o.func(sigmoid);
    this.po.push(this.o);


    this.layers[1] = Matrix.scale(this.c.func(tanH), this.o);
    this.pHidden.push(this.layers[1]);
    //this.hidden.show();
    for(let i = 1; i < this.weights.length; i++){
      this.layers[i + 1] = Matrix.product(this.weights[i], this.layers[i]);
      this.layers[i + 1].func(sigmoid);
    }
    // //this can be deleted if the network will be used for single output only. Gives extra computation time.
    // this.output = Matrix.product(this.Who, this.hidden);
    // this.output.func(sigmoid);
    this.output = this.layers[this.layers.length -1];
    //this.output.show();
  }

  /* A function to run through the array of input data.
  *  Takes input as a parameter. this function must safe all the actions so we can look back at it through time.
  */

  trainingRun(input){
    this.resetTime();
    for(let i = 0; i < input.length; i++){
      this.activate(input[i]);
    }
  }

  /* As the amount of input changes, we will want to change the numbers of inputs and the number of outputs.
  *  To do this we need to change the matrices.
  *  addInput and addOuput are both functions from the matrix class to add a column or a row.
  *  NOTE you need to change the data as well. If you pass in the data with incorrect sizes
  *  an error will occur.
  */

  addInput(){
    //Here we need to change all the weights which use the input values.
    this.Wf = Matrix.addInput(this.Wf);
    this.Wi = Matrix.addInput(this.Wi);
    this.Wo = Matrix.addInput(this.Wo);
    this.Wg = Matrix.addInput(this.Wg);
    this.netconfig[0]++;
  }

  addOuput(){
    //We need to call all the matrices which need the size of the output. thus in this case only the weights from hidden to output.
    this.Who = Matrix.addOutput(this.Who);
  }

  /* Weneed a function we can call to actually use the network.
  *  TrainingRun is used to run the network without any output/console.log.
  *  Run will output the result and return it inside of a string for further data processing.
  */

  run(input){

    if(typeof input == "string"){
      input = neuralNetwork.toData(input);
    }
    this.resetTime();
    for(let i = 0; i < input.length; i++){
      this.pInput.push(input[i]);
      this.activate(input[i]);
    }

    if(this.outputFunctions != undefined){
      let out = Matrix.toArray(this.output);
      let index = out.indexOf(Math.max.apply(window, out));
      return this.outputFunctions[0](index);
    }
    this.output.show();
    return Matrix.toArray(this.output);

  }

  /* A training function. takes array of input and array of desired output as parameters.
  *  We must loop through all the inputs to create the through time effect.
  * 2 stages: first normal bp then bp through time.
  */
  train(input, desired){
    this.trainingRun(input);
    let error = Matrix.substract(Matrix.fromArray(desired), this.output);

    this.error = error;
    /* Adjust the hidden to output layer of weights.
    *  Then adjust the error to make it ready for bacprop. through time.
    */

    for(let i = this.weights.length -1; i > 0; i--){
      let inT = Matrix.transpose(this.layers[i]);
      let wT = Matrix.transpose(this.weights[i]);

      let change = Matrix.product(error, inT);
      this.weights[i].add(change);

      error = Matrix.product(wT, error);
    }

    /* Now we need to go back through time.
    *  First of all we need to loop through all the timesteps we have taken.
    *  T - i can be used. Herein T is the total amount of timesteps counted from 0 and i = timesteps.length.
    *  In the end we need to multiply by the forget gate
    *  The error vector carries the derivative back.
    *  Before backpropagating the cell states we need to pass it through the 'hidden' filter
    *  and through the derivative of the TANH of the cell state at that moment in time.
    *  As that is the only time we make use of the hidden state, we only adjust o at that point in time.
    */

    //Pass the error through the Fo gate:
    error = Matrix.scale(this.po[this.po.length-1], error);

    //Change the o value with the transposed input:
    let Ti = Matrix.transpose(this.pInput[this.pInput.length-1]);
    let WoC = Matrix.product(error, Ti);
    this.Wf.add(WoC);

    //We need to enter the network via the tanH function. This is necessary it
    //Will not wor without this unlike the sigmoid derivatives!
    error = Matrix.scale(this.pc[this.pc.length-1].func(dtanH), error);

    let t = input.length;

    for(let i = 1; i < input.length; i++){
      //console.log("in here");
      let Tinput = Matrix.transpose(this.pInput[t-i]);

      //  this.WfB += error.getSum();
      let WfC = Matrix.product(error, Tinput);


      this.Wf.add(WfC);

      let WiC = Matrix.scale(error, this.pg[t-i]);
      WiC = Matrix.product(error, Tinput);
      this.Wi.add(WiC);

      let WgC = Matrix.scale(error, this.pi[t-i]);
      WgC = Matrix.product(error, Tinput);
      this.Wg.add(WgC);

      // let WoC

      error = Matrix.scale(error, this.pf[t - i]); //The the step where data is and i the amount we have stepped back in time.
    }
  }


  /* After every run we need to reset the through time datasets.
  *  This will restore it back to default settings.
  *  The time 'memomry' consits of a couple of arrays don't forgett.
  */
  resetTime(){
    this.pInput = new Array();
    this.pHidden = new Array();
    this.pOutput = new Array();
    this.pc = new Array();
    this.pf = new Array();
    this.pi = new Array();
    this.pg = new Array();
    this.po = new Array();
    //Fill pHidden with 0's.
    let temp = new Matrix(this.netconfig[1]);
    temp.fill(0);
    this.pHidden.push(temp);
    this.pc.push(temp);
    this.c = new Matrix(this.netconfig[1]);
    this.c.fill(0);
  }

/* A function we want to use to change the data we get from a json file into
*  a working object. We need to convert the objects into the matrix class so we can
*/
  static fromJSON(data){
    let result = new neuralNetwork(data.netconfig);
    result.Wf = Matrix.fromJSON(data.Wf);
    result.Wg = Matrix.fromJSON(data.Wg);
    result.Who = Matrix.fromJSON(data.Who);
    result.Wi = Matrix.fromJSON(data.Wi);
    result.Wo = Matrix.fromJSON(data.Wo);
    result.c = Matrix.fromJSON(data.c);
    result.cellInput = Matrix.fromJSON(data.cellInput);
    result.f = Matrix.fromJSON(data.f);
    result.g = Matrix.fromJSON(data.g);
    result.hidden = Matrix.fromJSON(data.hidden);
    result.i = Matrix.fromJSON(data.i);
    result.o = Matrix.fromJSON(data.o);
    result.output = Matrix.fromJSON(data.output);
    return result;
  }

  //ONE OUTPUT SIMPLIFICATION-----------------------------------------------
  setOutput(func){
    this.outputFunctions = func;
  }

  setData(td){
    this.data = td;
    for(let j = 0; j < 20; j++){
      for(let i = 0; i < td.length; i++){
        let target = new Array(this.ol).fill(0);
        target[td[i][1]] = 1;
        this.train(neuralNetwork.toData(td[i][0]), target);
      }
    }
  }

  addData(ad){
    this.data.concat(ad);
    for(let j = 0; j < 100; j++){
      for(let i = 0; i < this.data.length; i++){
        let target = new Array(this.ol).fill(0);
        target[this.data[i][1]] = 1;
        this.train(neuralNetwork.toData(this.data[i][0]), target);
      }
    }
  }

  setRecognition(cont = false){
    this.rec.continuous = true;
    this.rec.interimResults = false;
    this.rec.lang = 'en-US';
    this.rec.onstart = function() { }
    this.rec.neuralNetwork = this;
    this.rec.onresult = function(event) {
      this.neuralNetwork.run(event.results[0][0].transcript);
      console.log(event.results[0][0].transcript);
      this.stop();
    }
    this.rec.onerror = function(event) { }
    if(cont){
      console.log("doing this");
      this.rec.onend = function() {
        this.start();
       }
    } else {
      this.rec.onend = function(){
        console.log("turning off");
      }
    }

  }

  beginRecognition(){
    this.rec.start();
  }

  endRecognition(){
    this.rec.onend = function(){
      this.onend = function(){
        this.start();
      }
    }
    this.rec.stop();
  }

  //--------------Word output. A sequence.

  trainNetwork(inp){
    let input = inp.slice();
    //Input in an array with 2 strings. Get the strings to normal data a LSTM cell can handle.
    for(let i = 0; i < input.length; i++){
      input[i] = neuralNetwork.toData(input[i]);
    }
    input = neuralNetwork.ctd(input);

    //Train the network.
    for(let i = 0; i < input.length; i++){
      this.train(input[i][0], input[i][1][0]);
    }
  }

  runNetwork(string){
    //Now the tricky part: we want to run the output.
    let input = string;
    let r = '';
    let result = '';
    let killSwitch = 0;

    do{
      r = this.run(input);
      input += r
      result += r;
      killSwitch++;
    } while((r != ".") && (killSwitch < 200));

    return result;
  }

  static ctd(x){
    let d = new Array();
    for(let i = 0; i < x.length; i++){
      d.push(x[i].slice());
    }
    let result = new Array();
    let subresult = new Array(2);
    let length = d[1].length;

    for(let i = 0; i < length; i++){
      subresult[0] = d[0].slice();
      subresult[1] = [d[1][0]].slice();
      d[0].push(d[1].shift());
      result.push(subresult);
      subresult = new Array(2);
    }
    console.log(result);
    return result;
  }

  static toData(p){
    let t = p.split('');

      //Convert input data to usable data.
      let abc = 'abcdefghijklmnopqrstuvwxyz .'.split('');
      let data = new Array(t.length);
      data.fill(new Array(t.length));
      for(let i = 0; i < data.length; i++){
        data[i] = new Array(abc.length);
        data[i].fill(0);
      }

      //Change the data
      for(let i = 0; i < t.length; i++){
        for(let j = 0; j < abc.length; j++){
          if(t[i] === abc[j]){
            data[i][j] = 1;
            break;
          }
        }
      }
    return data;
  }
}

function sigmoid(x) {
    return 1/(1+Math.pow(Math.E, -x));
}

function sigmoidD(x){
  return sigmoid(x) * (1-sigmoid(x));
}

function tanH(x){
  return Math.tanh(x);
}

function dtanH(x){
  return(1 - (tanH(x) * tanH(x)));
}
