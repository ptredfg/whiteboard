﻿(function () {

	var clearMsg = {
		"type": "clear"
	};

	function toggle(elem) {
		if (Tools.menus["File"].menuOpen()) {
			Tools.menus["File"].show(false);
			onQuit();
		} else {
			Tools.menus["File"].show(true);
			window.addEventListener("keydown", keyDown,);
		}
		if (!menuInitialized) initMenu(elem);
	};

	var menuInitialized = false;
	var button;

	function initMenu(elem) {
		button = elem;
		var btns = document.getElementsByClassName("submenu-file");
		for (var i = 0; i < btns.length; i++) {
			var id = btns[i].id.substr(8);
			if (id.startsWith("digit")) {
				console.log(btns[i].id)
				btns[i].addEventListener("wheel", evt => {
						evt.preventDefault();
						evt.target.textContent = (new Number(evt.target.textContent) - Math.sign(evt.deltaY*0.01)) % 10;
						if (evt.target.textContent == -1) evt.target.textContent = 9

						if (timeout) clearTimeout(timeout)
						timeout = setTimeout(tryLoad, 600)
					}
				)
				btns[i].addEventListener("touchstart", startChange)
				btns[i].addEventListener("mousedown", startChange)
				btns[i].addEventListener("click", e => {
					e.preventDefault()
					changeSelect(e.target)
				 })
			} else {
				btns[i].addEventListener("click", menuButtonClicked);
			}
		}
		menuInitialized = true;
	};

	var currentDigit = 0;

	function changeSelect(p) {
		for(var i=0; i<3; i++)
			document.getElementById("submenu-digit-" + i).classList.remove("selected")
		if(p==null) {
			currentDigit = 0;
			return
		}
		if(p instanceof Number)
			p = document.getElementById("submenu-digit-" + p)
		p.classList.add("selected")
		currentDigit = p.id.substr(14)
	}

	function keyDown(evt) {
		evt.preventDefault();
		code = -1
		if (evt.code.startsWith("Numpad")) {
			code = evt.code.substr(6)
		}
		if (evt.keyCode >= 48 && evt.keyCode <= 57) {
			code = evt.keyCode - 48
		}

		if (code >= 0) {
			var elem = document.getElementById("submenu-digit-" + currentDigit)
			elem.textContent = code
			elem.classList.remove("selected")
			currentDigit++;
			currentDigit = currentDigit % 3;
			document.getElementById("submenu-digit-" + currentDigit).classList.add("selected")
		}
		return false
	}

	var changeValue;
	var changeElem;
	var changeX;
	var changeY;
	function startChange(evt) {
		changeSelect(evt.target)
		evt.preventDefault();
		changeValue = new Number(evt.target.textContent)+100
		changeElem = evt.target;
		changeX = evt.clientX || evt.targetTouches[0] && evt.targetTouches[0].clientX;
		changeY = evt.clientY || evt.targetTouches[0] && evt.targetTouches[0].clientY;
		document.addEventListener("mousemove", changeMove)
		document.addEventListener("touchmove", changeMove)
		document.addEventListener("touchend", resetChange)
		document.addEventListener("touchleave", resetChange)
		document.addEventListener("touchcancel", resetChange)
	}

	function resetChange(evt) {
		if(evt && evt.type.startsWith("touch") )
			changeSelect(null)
		document.removeEventListener("mousemove", changeMove)
		document.removeEventListener("touchmove", changeMove)
		document.removeEventListener("touchend", resetChange)
		document.removeEventListener("touchleave", resetChange)
		document.removeEventListener("touchcancel", resetChange)
	}

	var timeout;

	function changeMove(evt) {
		dx = changeX - (evt.clientX || evt.targetTouches[0].clientX);
		dy = changeY - (evt.clientY || evt.targetTouches[0].clientY);

		newVal = Math.round(changeValue - dx / 16) % 10
		changeElem.textContent = newVal
		if (evt.buttons == 0) {
			resetChange()
		}

		if(timeout) clearTimeout(timeout)
		timeout = setTimeout(tryLoad, 600)
	}

	function tryLoad() {
		value =
			new Number(document.getElementById("submenu-digit-0").textContent.trim() +
			document.getElementById("submenu-digit-1").textContent.trim() +
			document.getElementById("submenu-digit-2").textContent.trim())
		console.log(value)
	}

	var menuButtonClicked = function () {
		curTool = this.id.substr(8);
		console.log(curTool)
		gtag('event', 'click', { 'event_category': curTool });
		Tools.menus["File"].show(false);
		switch(curTool) {
			case "clear": clearBoard(); break;
			case "new": createNew(); break;

		}
	};

	function draw(data) {
		switch (data.type) {
			case "clear":
				Tools.clearBoard(false);
				break;
			default:
				console.error("Clear: 'clear' instruction with unknown type. ", data);
				break;
		}
	}

	function clearBoard(evt) {
		gtag('event', 'click', { 'event_category': 'clear' });
		Tools.acceptMsgs = false;
		draw(clearMsg, true);
		Tools.send(clearMsg, "Clear");
	};


	function makeid(length) {
		var result = [];
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result.push(characters.charAt(Math.floor(Math.random() *
				charactersLength)));
		}
		return result.join('');
	}

	function createNew() {
		gtag('event', 'click', { 'event_category': 'new' });
		window.location = "/board.html?board=" + makeid(24) + "#500,500,1.00"
	}

	function menuListener(elem, onButton, onMenu, e) {
		if(e.target.id=="rect_1") onQuit()
		if (!onMenu && !onButton) {
			e.stopPropagation();
			return true;
		}
		return false;
	};

	function onStart() {
		gtag('event', 'click', { 'event_category': 'file' });
		toggle();
	}

	function onQuit() {
		window.removeEventListener("keydown", keyDown);
		changeSelect(null)
	}

	Tools.add({
		"iconHTML": "<i class='fa fa-folder'></i>",
		"name": "File",
		"title": "Clear / New / Share",
		"toggle": toggle,
		"listeners": {
			"press": onQuit
		},
		"menu": {
			"content": `<div class="tool-extra submenu-file" id="submenu-clear">
							<span class="tool-icon"><i class="far fa-trash-alt"></i></span>
						</div>
						<div class="tool-extra submenu-file" id="submenu-new">
							<span class="tool-icon"><i class="far fa-file"></i></span>
						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-0" title="Sharing code active when the menu is open">
							4
						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-1" title="Sharing code active when the menu is open">
							6
						</div>
						<div class="tool-extra submenu-file digit" id="submenu-digit-2" title="Sharing code active when the menu is open">
							3
						</div>`,
			"listener": menuListener
		},
		"draw": draw,
		"mouseCursor": "default",
		"stylesheet": "tools/file/file.css",
		"onstart": onStart,
		"onquit": onQuit
	});

})();
