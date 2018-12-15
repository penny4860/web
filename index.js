/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from '@tensorflow/tfjs';


import {write_status} from './ui';
import {catElement, filesElement, fileContainerElement} from './doc';
import {predict_fn} from './predict';



const MOBILENET_MODEL_PATH =
    // tslint:disable-next-line:max-line-length
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';

const IMAGE_SIZE = 224;


let mobilenet;
const mobilenetDemo = async () => {
  // 1. 초기 message
  write_status('Loading model...');

  // 2. wait : loading 이 끝나기를 기다린다.
  //  mobilenetDemo() 내부 코드는 tf.loadModel(MOBILENET_MODEL_PATH);
  //  가 끝난 다음에 실행된다.
  //  단, thread의 제어권은 mobilenetDemo() 밖의 코드를 실행하다가
  //  로드가 끝나면 그 뒷라인을 실행한다.
  mobilenet = await tf.loadModel(MOBILENET_MODEL_PATH);

  // 3. warmup 
  //  Warmup the model. This isn't necessary, but makes the first prediction
  //  faster. Call `dispose` to release the WebGL memory allocated for the return
  //  value of `predict`.
  mobilenet.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();

  // 4. loading 이 끝나면 message를 지운다.
  write_status('');

  
  // 5. Make a prediction through the locally hosted cat.jpg.
  if (catElement.complete && catElement.naturalHeight !== 0) {
    predict_fn(mobilenet, catElement);
    catElement.style.display = '';
  } else {
    catElement.onload = () => {
      predict_fn(mobilenet, catElement);
      catElement.style.display = '';
    }
  }
  fileContainerElement.style.display = '';
  
  // 6. add event
  addListener(mobilenet);
};


function addListener(model) {
  filesElement.addEventListener('change', evt => {
    let files = evt.target.files;
    // Display thumbnails & issue call to predict each image.
    for (let i = 0, f; f = files[i]; i++) {
      // Only process image files (skip non image files)
      if (!f.type.match('image.*')) {
        continue;
      }
      let reader = new FileReader();
      const idx = i;
      // Closure to capture the file information.
      reader.onload = e => {
        // Fill the image & call predict.
        let img = document.createElement('img');
        img.src = e.target.result;
        img.width = IMAGE_SIZE;
        img.height = IMAGE_SIZE;
        img.onload = () => predict_fn(model, img);
      };
  
      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  });
};


mobilenetDemo();


