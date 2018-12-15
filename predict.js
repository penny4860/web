
const TOPK_PREDICTIONS = 10;

/**
 * Given an image element, makes a prediction through mobilenet returning the
 * probabilities of the top K classes.
 */
async function predict(imgElement) {
    write_status('Predicting...');
  
    const startTime = performance.now();
    const logits = tf.tidy(() => {
      // tf.fromPixels() returns a Tensor from an image element.
      const img = tf.fromPixels(imgElement).toFloat();
  
      const offset = tf.scalar(127.5);
      // Normalize the image from [0, 255] to [-1, 1].
      const normalized = img.sub(offset).div(offset);
  
      // Reshape to a single-element batch so we can pass it to predict.
      const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
  
      // Make a prediction through mobilenet.
      // preds = mobilenet.predict(batched); 
      // return preds;
      return mobilenet.predict(batched); 
    });
  
    // Convert logits to probabilities and class names.
    const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
    const totalTime = performance.now() - startTime;
    write_status(`Done in ${Math.floor(totalTime)}ms`);
  
    // Show the classes in the DOM.
    showResults(imgElement, classes);
  }



  /**
 * Computes the probabilities of the topK classes given logits by computing
 * softmax to get probabilities and then sorting the probabilities.
 * @param logits Tensor representing the logits from MobileNet.
 * @param topK The number of top predictions to show.
 */
export async function getTopKClasses(logits, topK) {
    const values = await logits.data();
  
    console.log("length: ", values.length);
    console.log("values: ", values);
  
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
      topkValues[i] = valuesAndIndices[i].value;
      topkIndices[i] = valuesAndIndices[i].index;
    }
  
    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
      topClassesAndProbs.push({
        className: IMAGENET_CLASSES[topkIndices[i]],
        probability: topkValues[i]
      })
    }
    return topClassesAndProbs;
  }


  //
// UI
//

function showResults(imgElement, classes) {
    const predictionContainer = document.createElement('div');
    predictionContainer.className = 'pred-container';
  
    const imgContainer = document.createElement('div');
    imgContainer.appendChild(imgElement);
    predictionContainer.appendChild(imgContainer);
  
    const probsContainer = document.createElement('div');
    for (let i = 0; i < classes.length; i++) {
      const row = document.createElement('div');
      row.className = 'row';
  
      const classElement = document.createElement('div');
      classElement.className = 'cell';
      classElement.innerText = classes[i].className;
      row.appendChild(classElement);
  
      const probsElement = document.createElement('div');
      probsElement.className = 'cell';
      probsElement.innerText = classes[i].probability.toFixed(3);
      row.appendChild(probsElement);
  
      probsContainer.appendChild(row);
    }
    predictionContainer.appendChild(probsContainer);
  
    predictionsElement.insertBefore(
        predictionContainer, predictionsElement.firstChild);
  }


export {predict};
