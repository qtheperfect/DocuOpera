document.oncontextmenu = function (event) {
    event.preventDefault();
};

var cookable={}
var cookedRecords = document.cookie.split(";")


var baseLoc = window.location.href.match("[^/]+//[^?]+")
var seekto = window.location.href.match(/seekto=([^&].*)/)

var pdfUrl = window.location.href.match(/pdf=([^&].*)/)

if (pdfUrl){
    pdfUrl=pdfUrl[1];
    getPDF(pdfUrl);
}
if (seekto) {
    seekto = decodeURI(seekto[1])
    cookable = JSON.parse(seekto)
    document.cookie = JSON.stringify(cookable)
}
else if (cookedRecords[0].length>0){
    cookable = JSON.parse(cookedRecords[0])
    var newLoc = seekableURI()
    if (confirm("Follow cookie to " + newLoc + " ?")) {
	window.location.href = newLoc
    }
    
}
else
    document.cookie = JSON.stringify(cookable)


function seekableURI(){
    seekto = JSON.stringify(cookable)
    return baseLoc + "?seekto=" + encodeURI(seekto)
}


var bLen = picArray.length;
var bP = -1;
var bigLeap = 10;

var plany
if (cookable.cAudio)
    plany = new Playab(cookable.cAudio)
else
    plany = new Playab(audioArray[0])



var resultIndex=0
var results = document.getElementsByClassName("img-zoom-result")

function fillResult(r, u){
    r.style.backgroundImage="url('" + u + "')"
}

function pageForward(pace = 1){
    bP = ((bP+pace) % bLen + bLen) % bLen;
    img = document.getElementById("myimage");
    var result= results[resultIndex]

    if (picArray[bP]){
	img.src = picArray[bP];
	fillResult(result,img.src) 
    }
    else{
	getPageI(bP, true, pace, true, result=result);
    }
}

function pageBackward(pace) {
    pageForward( - pace )
}


var pdfTsk;
var sidePix=300;

//	 var canvas = document.createElement("canvas");
//      canvas.className = "img-org"

//	 pdfTsk = new Array();




function getPageCache(cacheNum=5){
    var pagesClose = new Array(cacheNum);
    for (var i=0; i<cacheNum; i++){
	var pg = new Object;
	pg.p = -1;
	pg.c = document.createElement("canvas")
	pg.c.cimg=document.createElement("img")
	pg.c.cimg.className=".img-org"
	pagesClose[i] = pg;
    }

    var res = new Object;
    
    res.getACanvas = function(n){
	pagesClose.unshift(pagesClose.pop())
	pagesClose[0].p = n
	return pagesClose[0].c
    }

    
    res.getRightCanvas = function(n){
	pgn = pagesClose.findIndex( (x) => x.p==n )
	if (pgn>=0){
	    var pg1 = pagesClose.splice(pgn, 1)
	    pagesClose = pg1.concat(pagesClose)
	    return pagesClose[0].c
	}
	else{
	    return false
	}
    }
    return res
}
var pgs = getPageCache();
var pubCanvas = document.createElement("canvas")

function getPDF(pdfUrl = pdfUrl){
    picArray = new Array();
    pdfTsk = pdfjsLib.getDocument(pdfUrl);
    pdfTsk.promise.then( function(pdf) {bLen = pdf.numPages; getPageI(bP)})
    pgs = getPageCache();
}	     

var fetchPDF = document.createElement('input');
fetchPDF.type = 'file';
fetchPDF.onchange = e => {
    ///    var reader = new FileReader();
    pdfUrl = URL.createObjectURL(fetchPDF.files[0]);
    getPDF( pdfUrl );
    //bP=-1;
    pageForward();
}


function getPageI(i, really=true, pace=1, notForce=true,result=document.getElementById("myresult")){

    img = document.getElementById("myimage");
    var cNew = pgs.getRightCanvas(i)
    if (cNew && notForce) {
	if(really){
	    /* canvas.width = cNew.width;
	       canvas.height = cNew.height;
	       canvas.getContext("2d").drawImage(cNew, 0, 0)
	       result.appendChild(canvas) */
	    // img.parentNode.insertBefore(canvas2, img)
	    while (result.firstChild)
		result.removeChild(result.firstChild)
	    img.src = cNew.cimg.src
	    fillResult(result, cNew.cimg.src)
	    result.appendChild(cNew)

	    // load double page here:
	    // getPageI((bLen + i-1)%bLen, false, pace, result=document.getElementById("myresult2"))
	    if (pace != 0){
		getPageI((i+pace)%bLen, false, pace)
		getPageI((bLen + i-pace)%bLen, false, pace)
	    }
	}
	return false;
    }

    pdfTsk.promise.then( function( pdf) {
	//		 picArray = new Array( bLen );
	bLen = pdf.numPages;
	pdf.getPage(i+1).then( function( page ) {
	    console.log("running at page " + i )
	    var viewport = page.getViewport( 3 );


	    var cNew = pgs.getACanvas(i)
	    cNew.className = img.className;
	    var contextNew = cNew.getContext("2d");
	    //		     ctx2.drawImage(canvas, 0, 0);
	    cNew.width = viewport.width;
	    cNew.height = viewport.height;
	    var renderContext = {canvasContext:contextNew, viewport:viewport};
	    newRender = page.render( renderContext );

	    if (really){
		
		while(result.firstChild)
		    result.removeChild(result.firstChild)
		result.appendChild(cNew)
		
		var c = cNew
		newRender.then(()=>{
		    c.cimg.src = c.toDataURL();
		    result.style.backgroundImage = "url('" + c.cimg.src + "')"
		    img.src = c.cimg.src
		})


	    }
	    else {
		var c = cNew
		newRender.then(()=>{
		    c.cimg.src = c.toDataURL()
		})
	    }

	    if (really && pace != 0){
		// load double page here
		// getPageI((i+1)%bLen, true, pace, result=document.getElementById("myresult2"))
		getPageI((i+pace)%bLen, false, pace)
		getPageI((i-pace + pace*bLen)%bLen, false, pace)
	    }
	    // canvas2.getContext("2d").drawImage(canvas, 0, 0)
	    


	    
	    /* 
	       if (ctx) {
	       ctx.clearRect(0, 0, canvas.width, canvas.height);
	       ctx.beginPath();
	       }

	       if (ctx2) {
	       ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
	       ctx2.beginPath();
	       } */
	}, function(r){console.log(r)} )//.then(()=>{canvas2.getContext("2d").drawImage(canvas, 0, 0)})
    })
}


function getWholePDF(){
    // An unpracticable function unless you have 1Tb memory...
    pdfTsk.promise.then( function(pdf){
	bLen = pdf.numPages;
	picArray = new Array(bLen);
	for (i=0; i<bLen; i++){
	    getPageI(i);
	}
    } )
}

function imageZoom(imgID, resultID) {
    var img, lens, result;
    var howLarge=5;
    img = document.getElementById(imgID);

    result = document.getElementById(resultID);
    verbose = document.getElementById("verbose");


    
    var historyLens = new Array();
    var historyLimit = 3;



    /*set background properties for the result DIV:*/
    result.style.backgroundImage = "url('" + img.src + "')";

    //	     imgRec = img.getBoundingClientRect();
    //	     imgWidth = imgRec.width;
    //	     imgHeight = imgRec.height;
    //
    //	     result.style.backgroundSize = (imgWidth * howLarge) + "px " + (imgHeight * howLarge) + "px";
    
    //	     result.style.width = imgWidth * howLarge + "px";
    //	     result.style.height = imgHeight * howLarge + "px";

    /*execute a function when someone moves the cursor over the image, or the lens:*/
    
    lens = document.createElement("DIV");
    lens.setAttribute("class", "img-zoom-lens");

    var lensPosition;

    function blinkLens( firstTime = false ) {
	var result  = results[results.length - 1]
	rerec = result.parentNode.getBoundingClientRect();
	imrec = img.getBoundingClientRect();
	img.parentElement.insertBefore(lens, img);
	if (firstTime) {
	    lensPosition = {
		x:0,
		y:0,
		w:rerec.width / howLarge,
		h:rerec.height / howLarge,
		l: howLarge,
		xMax:imrec.width,
		yMax:imrec.height	     
	    }
	}
	else {
	    lensPosition.xMax = imrec.width;
	    lensPosition.yMax = imrec.height;
	}
	return lensPosition;
    }
    blinkLens( true );
    //lens.style.width = rerec.width / howLarge + "px";
    //lens.style.height = rerec.height  / howLarge + "px";
    //verbose.innerHTML= result.getBoundingClientRect().height;
    /*insert lens:*/

    function putLens(){
	lens.style.left = lensPosition.x + "px";
	lens.style.top = lensPosition.y + "px";
	lens.style.width = lensPosition.w + "px";
	lens.style.height = lensPosition.h + "px";
    }
    
    putLens();
    
    img.addEventListener("load", function(){resetScale(howLarge); blinkLens();});
    
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);




    function mouseVari(e){
	e.preventDefault();
	if (e.button==0){
	    followBetterForward();
	}
	else{
	    
	    followBetterBackward();
	}
	return false;
    }
    //result.addEventListener("mousedown", mouseVari);
    //	     result.contextmenu(function(){return false;});
    // NOTE: WTF

    // window.addEventListener("mousedown", followBetterForward);
    
    document.body.addEventListener("keydown", translateKey);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    // note: window.addEventListener facilitates onload action.
    
    function moveLens(e) {
	var pos, x, y;
	/*prevent any other actions that may occur when moving over the image:*/
	e.preventDefault();
	/*get the cursor's x and y positions:*/
	pos = getCursorPos(e);
	/*calculate the position of the lens:*/
	x = pos.x - (lens.offsetWidth / 2);
	y = pos.y - (lens.offsetHeight / 2);
	lensPosition.x = x
	lensPosition.y = y
	lensPosition = betterLens()
	/*prevent the lens from being positioned outside the image:*/
	//		 verbose.innerHTML = JSON.stringify(lensPosition);
	putLens()
	followLens()
    }
    
    function getCursorPos(e) {
	var a, x = 0, y = 0;
	e = e || window.event;
	/*get the x and y positions of the image:*/
	a = img.getBoundingClientRect();
	/*calculate the cursor's x and y coordinates, relative to the image:*/
	x = e.pageX - a.left;
	y = e.pageY - a.top;
	/*consider any page scrolling:*/
	x = x - window.pageXOffset;
	y = y - window.pageYOffset;
	// verbose.innerHTML=x+", " +y; // <- Watch position instantly 
	return {x : x, y : y};
    }
    function getRatePos(e, o){
	var r = o.getBoundingClientRect()
	var x = e.clientX - r.left
	var y = e.clientY - r.top
	return {x: x/r.width, y:y/r.height}
    }
    function turnByTouch(e){
	var xyr = getRatePos(e, result.parentNode);
	var x=xyr.x
	var y = xyr.y
	if (y<0.4){
	    if (x < 0.4)
		prePage(1)
	    else if (x>0.6)
		nextPage(1)
	}
	else if (y>0.6){
	    if (x<0.4)
		followBetterBackward()
	    else if (x>0.6)
		followBetterForward()
	}
	else{
	    if (x < 0.4)
		prePage(bigLeap )
	    else if (x > 0.6)
		nextPage(bigLeap)
	}

	// Thanks to those ugly things in javascript:
	window.setTimeout(()=>plany.btns[0].focus(), 0)
    }
    result.parentNode.onmousedown = turnByTouch;
    
    var lastKeyE = false;
    repeatKey = 65;	     

    var keyDict = []
    
    function translateKey(e, minorKeyDict=null){
	// note: preventDefault to prevent default.
	if (! minorKeyDict)
	    minorKeyDict=keyDict
	if (! minorKeyDict[e.keyCode]){
	    return;
	}
	e.preventDefault();
	console.log( e.keyCode );
	minorKeyDict[e.keyCode]();
	if (e.keyCode != repeatKey){
	    lastKeyE = e;
	}
    }

    
    
    /* // right hand main mode:
       keyDict[190] = function(){resetScale( howLarge * 0.9765625 ) ; };
       keyDict[188] = function(){resetScale( howLarge * 1.024 );};
       keyDict[22] = stepLens;
       keyDict[74] = lowerLens;
       keyDict[75] = higherLens;
       keyDict[72] = lefterLens;
       keyDict[76] = righterLens;
       keyDict[82] = startStopBetter;
       keyDict[65] = addBetter;
       keyDict[32] = followBetterForward;
       keyDict[59] = killHistory; */
    
    // Left-hand main mode:

    keyDict[repeatKey ] = applyMore;
    
    keyDict[88] = function(){resetScale( howLarge * 0.9765625 ) ; };
    keyDict[90] = function(){resetScale( howLarge * 1.024 );};
    keyDict[22] = stepLens;
    keyDict[68] = lowerLens;
    keyDict[69] = higherLens;
    keyDict[83] = lefterLens;
    keyDict[70] = righterLens;
    
    keyDict[80] = startStopBetter;
    keyDict[84] = addBetter;
    
    keyDict[32] = followBetterForward;
    keyDict[86] = followBetterBackward;
    keyDict[71] = gotoFirstLast;
    keyDict[52] = autoBetterForward;

    
    keyDict[81] = killHistory;
    keyDict[66] = browseSwitch;

    keyDict[75] = quickGoto;


    // H key:

    hideOrNot = function(){
	if (img.parentElement.style.zIndex != -1){
	    img.parentElement.style.zIndex = -1;
	    if (pageBar){
		pageBar.style.left="0px";
		pageBar.style.right="100%"
	    }
	    result.parentElement.style.left = "5px";
	    followLens();
	}
	else {
	    img.parentElement.style.zIndex = 9;
	}
    }

    bringSideBack = function(){
	img.parentElement.style.zIndex = 9;
	if (pageBar) {
	    pageBar.style.right="0px";
	    pageBar.style.left="";

	}
	result.parentElement.style.left = sidePix + "px";
	followLens();		     
    }
    
    keyDict[72] = hideOrNot;
    keyDict[221] = bringSideBack;

    keyDict[82] = ()=>nextPage(1);
    keyDict[87] = ()=>prePage(1);
    keyDict[49] = function(){prePage(bigLeap)};
    keyDict[50] = function(){nextPage(bigLeap)};

    // 5
    keyDict[53] = ()=>getPageI(bP, true, 1, false)


    // keyboard O:
    //  keyDict[79] = function(){getPDF(prompt("Select The File", pdfList[0]));bP=-1; nextPage()};
    keyDict[79] = (e)=>fetchPDF.click()
    keyDict[76] = function(){
	pdfSheet = "- "
	for (i in pdfList){
	    pdfSheet = pdfSheet + i + " - " + pdfList[i] + "\n- ";
	}
	var n  = prompt(pdfSheet + "Input a num:", 0);
	if (! pdfList[n]){
	    n = pdfList.findIndex(x=>x.search(n)>=0)
	    if (n<0)
		return
	}
	var newTitle = pdfList[n].match(/[^\/]*$/)
	document.getElementById("title").innerHTML = "DocuOpera - "+newTitle;
	pdfUrl=pdfList[n]
	getPDF(pdfList[n]); 
	cookable.pdfUrl=pdfList[n]
	nextPage();
    }
    
    keyDict[48] = function(){
	audioSheet = "- "
	for (i in audioArray){
	    audioSheet = audioSheet + i + " - " + audioArray[i] + "\n- ";
	}
	var n  = prompt(audioSheet + "Input a num:", 0);
	if (! audioArray[n]) {
	    n = audioArray.findIndex(x=>x.search(n)>=0)
	    if (n<0)
		return
	}
	plany.changeFile(audioArray[n])
	cookable.cAudio=audioArray[n]
	cookIn()
    }

    keyDict[67]=function(){
	// show/hide audio panel 
	var minor_keyDict = new Array()
	minor_keyDict[37]=followBetterBackward
	minor_keyDict[39]=followBetterForward
	minor_keyDict[38]=prePage
	minor_keyDict[40]=nextPage
	
	if (plany.infoContainer.offsetHeight > 0){
	    plany.infoContainer.remove();
	}
	else{
	    img.parentElement.appendChild(plany.infoContainer);
	    plany.btns[0].focus();
	    plany.btns[0].onkeydown=(e)=>translateKey(e, minor_keyDict)
	}
	
    }


    keyDict[188] = ()=>{if(confirm(seekableURI())){window.open(seekableURI())}}
    keyDict[190] = cookOut

    function cookIn(){
	noBlob = (s)=>!(s.startsWith("blob"))
	if (noBlob(pdfUrl))
	    cookable.pdfUrl = pdfUrl
	if (noBlob(plany.player.src))
	    cookable.cAudio = plany.player.src
	if (betterLensList.length > 0)
	    cookable.betterLensList = betterLensList
	cookable.bP = bP
	cookable.bLen = bLen
	document.cookie=JSON.stringify(cookable)
    }

    function cookOut(){
	cookedRecords = document.cookie.split(";")
	var cookN = prompt(cookedRecords.join("\n"), 0)
	if (! cookedRecords[cookN]){
	    cookN = cookedRecords.findIndex(x=>x.search(cookN)>=0)
	    if (cookN < 0)
		return
	}

	cookable = JSON.parse(cookedRecords[cookN])

	if (cookable.betterLensList){
	    betterLensList = cookable.betterLensList
	    gotoFirstLast(true)
	}
	if (cookable.cAudio)
	    plany.changeFile(cookable.cAudio)
	
	if (cookable.pdfUrl){
	    pdfUrl = cookable.pdfUrl
	    getPDF(cookable.pdfUrl)
	}
	if (cookable.bLen)
	    bLen = cookable.bLen
	if (cookable.bP){
	    bP = cookable.bP-1
	    nextPage()
	}
	
    }


    keyDict[187]=doublePage
    keyDict[61]=doublePage
    function doublePage(){// key '=' show/hide secondary pageview on the right-half 
	var tester = secondaryContainer.offsetHeight 
	if ( tester && tester > 0){
	    document.getElementById("res-container").removeChild(secondaryContainer)
	}
	else{
	    document.getElementById("res-container").appendChild(secondaryContainer)
	}
	results = document.getElementsByClassName("img-zoom-result")
	resultIndex = 0
    }
    keyDict[187]()
    /* 
     * 	     toRepeatKey = 65;	     
     * 	     keyDict[toRepeatKey] = toRepeat;
     * 	      */
    /* 
     * 	     var keyRepeatTimes = 1;
     * 	     function makeRepeatPossible(times = keyRepeatTimes * 5){
     * 		 if (typeof(noter) != "undefined"){
     * 		     noter.remove()
     * 		 }
     * 		 noter = document.createElement("button");
     * 		 noter.innerHTML = "Repeat time: " + times;
     * 		 noter.setAttribute("class", "notify");
     * 		 noter.addEventListener("keydown", repeatSlavor);
     * 		 noter.addEventListener("click", noter.remove);
     * 
     * 		 function repeatSlavor(e){
     * 		     if (e.keyCode == toRepeatKey){
     * 			 return;
     * 		     }
     * 		     keyRepeatTimes = 1;
     * 		     noter.remove();
     * 
     * 		     for (i=0; i<times; i++){
     * 			 keyDict[e.keyCode]()
     * 		     }
     * 		 }
     * 		 document.body.appendChild(noter);
     * 		 noter.focus();
     * 	     }
     * 
     * 	     function toRepeat(e){
     * 		 makeRepeatPossible()
     * 		 keyRepeatTimes = keyRepeatTimes + 1;
     * 	     }
     * 
     *  */

    var keyRepeatTimes = 5;

    function applyMore(){
	if ( ! lastKeyE ) {
	    return;
	}
	for (i=1; i < keyRepeatTimes; i++){
	    keyDict[ lastKeyE.keyCode ]();
	}
    }

    function quickGoto(){
	nPage = prompt("Input The Page:", bLen);
	if (! nPage){
	    return
	}

	bP = nPage - 1;
	cookIn()
	nextPage();
    }
    
    var browsePace = 10;
    function browseSwitch(){
	if (browsePace == 1){
	    browsePace = 10;
	}
	else{
	    browsePace = 1;
	}
    }
    
    function lowerLens(){
	imgRec = img.getBoundingClientRect();
	lensPosition.yMax = imgRec.height;
	
	if (lensPosition.y < lensPosition.yMax - lensPosition.h ){
	    lensPosition.y = lensPosition.y + lensPosition.h * 0.024 * browsePace 
	}
	putLens();
	followLens();
    }
    
    function higherLens(){
	imgRec = img.getBoundingClientRect();
	lensPosition.yMax = imgRec.height;
	
	if (lensPosition.y > 0){
	    lensPosition.y = lensPosition.y - lensPosition.h * 0.024 * browsePace ;
	}
	putLens();
	followLens()
    }

    
    function lefterLens(){
	imgRec = img.getBoundingClientRect();
	//		 lensRec = lens.getBoundingClientRect();
	lensPosition.xMax = imgRec.width;
	if (lensPosition.x > 0){
	    lensPosition.x = lensPosition.x - lensPosition.w * 0.024 * browsePace ;
	}
	putLens()
	followLens()
    }
    
    function righterLens(){
	imgRec = img.getBoundingClientRect();
	//		 lensRec = lens.getBoundingClientRect();
	lensPosition.xMax = imgRec.width;
	if (lensPosition.x + lensPosition.w/2 < lensPosition.xMax){
	    lensPosition.x = lensPosition.x  + lensPosition.w * 0.024 * browsePace 
	}
	putLens()
	followLens()
    }

    function resetScale(ns, result=results[resultIndex]){
	howLarge = ns;
	lensPosition.l = ns;
	//set lens area
	resrec = results[results.length-1].parentNode.getBoundingClientRect();
	lensPosition.w = resrec.width / ns;
	lensPosition.h = resrec.height / ns;
	putLens()
	// set result area
	imgrec = img.getBoundingClientRect();
	result.style.width = imgrec.width * ns + "px";
	result.style.height =  imgrec.height * ns + "px";
	result.style.backgroundSize = (imgrec.width * howLarge) + "px " + (imgrec.height * howLarge) + "px";
	followLens();
	putAllHistory();
	
    }

    
    
    function largerLens(li){
	// Rebuild a history lens object from the record of  the Dict li.
	newLen = document.createElement("DIV");
	newLen.setAttribute("class", "last-lens");
	hl = li.l;
	newLen.style.left = li.x * howLarge + "px";
	newLen.style.top = li.y * howLarge + "px";
	newLen.style.width = li.w * howLarge + "px";
	newLen.style.height = li.h * howLarge + "px";
	return newLen;
    }

    function putLargerLens(k){
	// Put the k-th lens object to the larger board.
	var result = results[resultIndex]
	li = historyLens[k];
	if (li.son){
	    li.son.remove();
	}
	newLen = largerLens(li);
	if (k > 0){
	    newLen.setAttribute("class", "history-lens")
	}
	result.appendChild(newLen);
	historyLens[k].son = newLen;
    }

    function putAllHistory(){
	for (k in historyLens){
	    putLargerLens(k);
	}
    }
    function killHistory(){
	while( historyLens.length > 0 ){
	    badLi = historyLens.pop()
	    if (badLi.son){
		badLi.son.remove()
	    }
	}
    }
    
    function retrieveLens(li) {
	lensPosition = Object.assign({}, li);
	resetScale(li.l);
	putLens()
	followLens()
    }

    function addToHistory(){
	while(historyLens.length >= historyLimit){
	    badLi = historyLens.pop();
	    if (badLi.son){badLi.son.remove()};
	}

	li = betterLens()
	historyLens.unshift(li)
    }
    
    var betterLensList = new Array();
    if (cookable.betterLensList)
	betterLensList = cookable.betterLensList
    betterPicking  = false;
    betterCurrent = -1;
    
    function startStopBetter(){
	if (betterPicking){
	    betterPicking = false;
	    betterCurrent = -1;
	    killHistory();
	    alert("Scope List Restored.")
	    cookable.betterLensList = betterLensList
	    document.cookie = JSON.stringify(cookable)
	}
	else{
	    alert("Press <T> To Add Scopes, And <P> To Finish. ")
	    betterLensList.length = 0;
	    betterPicking = true;
	}
	
    }
    
    function addBetter() {
	if (betterPicking) {
	    li = betterLens();
	    betterLensList.push(li)
	    addToHistory();
	    putAllHistory();
	    verbose.innerHTML = "List: " + betterLensList.length;
	}
    }
    
    function followBetterForward(){
	var l = betterLensList.length;
	if (l <= 0) {
	    return 0
	}
	else {
	    addToHistory();
	    if (betterCurrent >= l-1) {
		nextPage()
		betterCurrent = 0;
	    }
	    else{
		betterCurrent =  betterCurrent + 1
		if (results.length > 1)
		    nextPage(0, true)
	    }
	    retrieveLens( betterLensList[betterCurrent] );
	    verbose.innerHTML =  betterCurrent + ", p" + bP + "/ " + bLen;
	    putAllHistory();
	}
    }

    var defaultInterval = 5;
    var currentShrink = defaultInterval;
    var incumbentInterval = -1;
    var incumbentShrink = -1;
    
    pageBar = document.createElement("div")
    pageBar.className = "page-bar";
    img.parentElement.appendChild(pageBar);
    function autoBetterForward(){
	function setBar(){
	    pageBar.style.height = currentShrink*100/defaultInterval + "%";
	}
	if ( incumbentInterval >= 0 ){
	    window.clearTimeout( incumbentInterval );
	    window.clearTimeout( incumbentShrink );
	    incumbentInterval = -1;
	    incumbentShrink = -1;
	    pageBar.style.height="0px";
	    return;
	}
	defaultInterval = prompt( "Interval In Seconds:", defaultInterval  );
	currentShrink = defaultInterval;
	
	if (defaultInterval < 2){ return; }
	
	intime = defaultInterval * 1000;
	incumbentInterval = window.setInterval(
	    function(){
		followBetterForward();
		currentShrink = defaultInterval;
		setBar();
	    },
	    intime)
	incumbentShrink = window.setInterval( function(){
	    currentShrink = currentShrink - 1;
	    setBar();
	}, 1000)
	// note: The use of typeof() == "unsigned" ...
	// note: the use of window. setInterval / setTimeout  / clearTimeout ...
	// note: prompt( text, defaulttext)
	// note "400" / 4 = 100
    }
    
    function followBetterBackward(){
	l = betterLensList.length;
	if (l <= 0) {
	    return 0
	}
	else {
	    addToHistory();
	    if (betterCurrent <= 0) {
		prePage()
		betterCurrent = l-1;
	    }
	    else {
		betterCurrent =  betterCurrent - 1;
		if (results.length>1)
		    nextPage(0, true)
	    }
	    verbose.innerHTML =  betterCurrent + ", p" + bP + "/ " + bLen;
	    retrieveLens( betterLensList[betterCurrent] );
	    putAllHistory();
	}
    }

    function gotoFirstLast(forceFirst=false){
	resultIndex = (resultIndex + 1) % results.length
	if (betterLensList.length <= 0) {
	    return;
	}
	addToHistory();
	if (betterCurrent == 0 && ! forceFirst ){
	    betterCurrent = betterLensList.length - 1;
	}
	else {
	    betterCurrent = 0;
	}
	retrieveLens( betterLensList[ betterCurrent ] );
	putAllHistory();
	verbose.innerHTML =  betterCurrent + ", p" + bP + "/ " + bLen;
    }
    

    yPace = 0.6;
    xPace = 0.8;
    
    function nextPage(pace = 1, pertainHistory=false){
	resultIndex=(resultIndex + 1) % results.length
	if (! pertainHistory)
	    killHistory();
	pageForward(pace);
	verbose.innerHTML =  betterCurrent + ", p" + bP + "/ " + bLen;
	blinkLens();
	cookIn()
	resetScale(howLarge);
    }
    
    function prePage( pace = 1, pertainHistory=false){
	resultIndex = (resultIndex + 1) % results.length
	if (! pertainHistory)
	    killHistory();
	pageBackward( pace);
	verbose.innerHTML =  betterCurrent + ", p" + bP + "/ " + bLen;
	blinkLens();
	cookIn()
	resetScale(howLarge);
    }

    function stepLens( ){
	// Obsolete !!
	// Some steps can be simplified using function getLensPos() ...
	
	lenRec = lens.getBoundingClientRect();
	imgRec = img.getBoundingClientRect();

	x = lenRec.left - imgRec.left ;
	y = lenRec.top - imgRec.top ;
	lh =  lenRec.height ;
	lw = lenRec.width ;

	function nextXY(x, y) {
	    yp = yPace * lh
	    y = y+ yp;
	    if ( y >= imgRec.height + yp - lh ) {
		y = 0;
		xp = lw * xPace;
		x = x + xp;
		if (x >= imgRec.width + xp - lw ) {
		    nextPage()
		    x = 0;}
	    }
	    return {x:x, y:y}
	}

	nxy  = nextXY( x, y )
	
	addToHistory()
	lensPosition.x = nxy.x;
	lensPosition.y = nxy.y;
	putLens();
	followLens();
	putAllHistory();		 
    }
    
    function stepBackLens( ){
	// obsolete !!
	lenRec = lens.getBoundingClientRect();
	imgRec = img.getBoundingClientRect();

	x = lenRec.left - imgRec.left ;
	y = lenRec.top - imgRec.top ;
	lh =  lenRec.height ;
	lw = lenRec.width ;

	function preXY(x, y) {
	    yp = yPace * lh
	    y = y - yp;
	    if ( y <= -yp ) {
		y = imgRec.bottom - lh;
		xp = lw * xPace;
		x = x - xp;
		if (x <= -xp ) {
		    img = prePage();
		    x = imgRec.right - lw;}
	    }

	    return {x:x, y:y}
	}
	nxy  = preXY( x, y )

	lens.style.left = nxy.x + "px";
	lens.style.top = nxy.y + "px";
	moveToLarge( nxy.x, nxy.y)
    }

    nthLens = 0
    xList = 0;
    function switchLens(xList, yList) {
	
    }
    
    function moveLarge(x, y, result=results[resultIndex]) {
	result.style.left = "-" + x + "px";
	result.style.top = "-" + y + "px";
    }
    
    function moveToLarge(x, y) {
	imgR = img.getBoundingClientRect()
	lensR = lens.getBoundingClientRect()
	if ( x > imgR.width - lensR.width ){
	    x = imgR.width - lensR.width;
	}
	else if (x < 0) { x = 0; }
	
	if (y > imgR.height - lensR.height){
	    y = imgR.height - lensR.height;
	}
	else if (y < 0 ) { y = 0; }
	moveLarge( x * howLarge, y * howLarge );
    }

    function followLens(){
	//		 lensRec = lens.getBoundingClientRect();
	//		 imgRec = img.getBoundingClientRect();
	//		 moveToLarge(lensRec.left - imgRec.left, lensRec.top - imgRec.top);
	lp = betterLens()
	
	moveLarge( lp.x * howLarge, lp.y * howLarge );
	
    }

    function betterLens(lp = lensPosition){
	if (lp.x < 0) {
	    x = 0;
	}
	else if (lp.x + lp.w /2 > lp.xMax) {
	    x = lp.xMax - lp.w;} 
	else {
	    x = lp.x
	}

	if (lp.y < 0) {
	    y = 0;
	}
	else if (lp.y + lp.h/2 > lp.yMax) {
	    y = lp.yMax - lp.h;} 
	else {
	    y = lp.y
	}
	return {x:x, y:y, w:lp.w, h:lp.h, xMax:lp.xMax, yMax:lp.yMax, l:lp.l}
    }
    return moveToLarge
}
fload =  function(){imageZoom("myimage", "myresult")};
window.addEventListener('DOMContentLoaded', fload);

