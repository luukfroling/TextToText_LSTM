<h1> Text to text neural network using LSTM </h1>

A neural network class which will generate a sentence based on the given input using an LSTM cell and a by the user given amount of hidden layers. 

<h1> Types of data processing </h1> 
 
 There are a couple of different ways to process data using this type of neural network. First of all we can create a response. The input data will be a question and the output data will be an answer. We can also give a single character as an input and create a standalone output. An output which is not related to a text input but rather a complete the sentence. 

<h1> documentation </h1> 

<h2> setting variables </h2>

To reduce the amount of input nodes, the data needs to be processed before we initialise the network. 
First, initialise an array which will hold the training data for the network. The first spot is the input and the second spot is the desired output. Also create a string with all the characters used in the training examples.
```javascript
let trainingData = ["training_data_input", "training_data_output"];
let data = "abcdefghijklmnopqrstuvwxyz_ ."
```
The constructor of the network requires an array containing all the characters used. Retrieving all the characters in an array format can be done with a static function included in the neural network class. 
```javascript
let charSet = neuralNetwork.getChars(data); 
```
The amount of nodes in the neural network must be given in array format as a parameter as well. Create a variable to hold the amount of input/output nodes we need to succesfully process the characters. <b> Be sure to include a '.' in your training data as this will terminate the output generating process. </b> 
```javascript
let char_nodes = neuralNetwork.getChars(data).length;
```

<h2> Constructor() </h2>
Now we need to initialise the network. Pass the variables created as parameters. We pass an array with the sizes of the layers as a parameter. There is no limit to the amount of hidden layers, but backpropagation does have the vanishing gradient problem you have to keep in mind. 
  
```javascript
let nn = new neuralNetwork([char_nodes, 100, 100, char_nodes], charSet);
```
<h2> nn.trainNetwork() </h2>

To train the network, we simply call trainNetwork on the nn object and pass the training data as a parameter. The network will take care of the data processing itself. This function does not return anything. This function must be called more than once to properly train the network on the data. In the future I plan on returning the error and/or make the network train untill a minimum error. 

```javascript
nn.trainNetwork(trainingData); 
```

<h2> nn.runNetwork() </h2> 

run the network on a given input. This will return a string terminated at the dot or after 200 characters. 

```javascript
let resultString = nn.runNetwork("training_data_input"); 
```
