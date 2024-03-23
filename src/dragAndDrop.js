const reader = new FileReader()

// Runs when the page is fully loaded
window.onload = function(){
    var fileUpload = document.getElementById("actual_button");
    var dropZone = document.getElementById("drop_zone");


	fileUpload.addEventListener("change",function (ev){
		var file = this.files[0];
		ProcessFile(file);
	});

    dropZone.addEventListener("drop",(event) => {
		event.preventDefault();
		dropHandler(event);
	});
	dropZone.addEventListener("dragover",(event) => {
		event.preventDefault();
	});
	dropZone.addEventListener("dragenter",(event) => {
		event.preventDefault();
		dragEnter(event);
	});
	dropZone.addEventListener("dragleave",(event) => {
		event.preventDefault();
		dragLeave(event);
	});
}


var addresses = []

reader.onload = function(e) {
	var resultText = reader.result;
	resultText = resultText.replaceAll('\r','');
	var texts = resultText.split('\n');
	texts.pop();

	console.log("Ran");
	while(texts.size > 100){
		texts.pop();
	}

	addresses = texts;
	console.log(addresses);
}

// Proccesses a file and reads addresses
function ProcessFile(file){
	if(file.name.endsWith(".txt") || file.name.endsWith(".csv"))
		reader.readAsText(file);
	else
		console.log("invalid file");
}

function dragOverHandler(ev){
	// console.log("dragOvered");
	ev.preventDefault();
}
		
function dropHandler(ev){
	// console.log("hello");
	if(ev.target.classList.contains("dragover"))
		ev.target.classList.remove("dragover");
	var file = ev.dataTransfer.files[0];
	ProcessFile(file);
}
function dragEnter(ev){
	// console.log("dragEnter");
	if(ev.target.id == "drop_zone")
		ev.target.classList.add("dragover");
}
function dragLeave(ev){
	// console.log("dragLeave");
	if(ev.target.id == "drop_zone")
		ev.target.classList.remove("dragover");
}
