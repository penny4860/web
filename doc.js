
// document.getElementById :  id 속성이 주어진 문자열과 일치하는 요소를 나타내는 Element 객체를 반환
// html document : Get <tag id == "status">
const catElement = document.getElementById('cat');
const filesElement = document.getElementById('files');
const fileContainerElement = document.getElementById('file-container');
const predictionsElement = document.getElementById('predictions');
const demoStatusElement = document.getElementById('status');


// Define status(msg) function
// HTML 문서에서 id 를 status 로 지정한 Element에 text를 부여
const write_status = msg => demoStatusElement.innerText = msg;
/*
function status(msg) {
  demoStatusElement.innerText = msg;

}
*/

export {write_status};
export {catElement, filesElement, fileContainerElement, predictionsElement};
