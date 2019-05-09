/* 9 - 5 - 2019 By Luuk Fröling
*  Via the 'return letter' dataset we try to connect the input letters with the output letters. 
*  we then try, using 'guess a' as an unknown input to let the neural network repeat the letter we are saying.
*  TODO: rewrite this statement. If the neural network returns the said letter, without being trained on the example we have confirmed that the NN included a relationship between the input and output nodes. 
*/


let nn;
let data = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .';
let trainingData = [
  ["return a", "a."],
  ["return b", "b."],
  ["return c", "c."],
  ["return d", "d."],

  ["guess d", "d."],
  ["guess b", "b."],
  ["guess c", "c."],
  ["dont say a", "b"]
]
function setup(){
  let charSet = neuralNetwork.getChars(data);
  let char_nodes = neuralNetwork.getChars(data).length;
  nn = new neuralNetwork([char_nodes, 50, 50, char_nodes], charSet);
  for(let i = 0; i <500; i++){
    for(let j = 0; j < trainingData.length; j++){
      nn.trainNetwork(trainingData[j]);
    }
  }
  nn.setRecognition(true);
  nn.beginRecognition();
}
