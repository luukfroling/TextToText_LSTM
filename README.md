<h1> Text to text neural network using LSTM </h1>

A neural network class which will generate a sentence based on the given input using an LSTM cell and a by the user given amount of hidden layers. 

<h1> documentation </h1> 

<h2> setting variables </h2>

To reduce the amount of input nodes, the data needs to be processed before we initialise the network. 
First, initialise a variable which will hold the training data for the network. 
```javascript
let data = "training_data";
```
The constructor of the network requires an array containing all the characters used. Retrieving all the characters in an array format can be done with a static function included in the neural network class. 
```javascript
let charSet = neuralNetwork.getChars(data); 
```
The amount of nodes in the neural network must be given in array format as a parameter as well. Create a variable to hold the amount of input/output nodes we need to succesfully process the characters. <b> Be sure to include a '.' in your training data as this will terminate the output generating process. </b> 
```javascript
let char_nodes = neuralNetwork.getChars(data).length;
```

<h2> onstructor() <h2>
Now we need to initialise the network. Pass the variables created as parameters. 
  
  ```javascript
let nn = new neuralNetwork([char_nodes, 100, 100, char_nodes], charSet);
```
