import { score } from "./input";

const msgbox = document.getElementById("msgbox");
const msgtitle = document.getElementById("msgtitle");
const msgbody = document.getElementById("msgbody");

function addListener(id: string, eventType: string, listener: EventListener) {
	document.getElementById(id).addEventListener(eventType, listener);
}

addListener("mainmenu1", "click", () => {
	window.location.href = "/";
});

export function win(message) {
	msgbox.hidden = false;
	msgbody.textContent = `message\ndirt used: ${score}`;
}
export function lose(message) {
	msgbox.hidden = false;
	msgbody.textContent = message;
}
