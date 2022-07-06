let savedNick = window.localStorage.getItem("nick");
if (savedNick) {
    document.getElementById("nameInput").value = savedNick;
}

let lagMode = window.localStorage.getItem("lagMode");
if (lagMode) {
    document.getElementById("lagCompensationMode").value = lagMode;
}

document.getElementById("lagCompensationMode").addEventListener("change", () => {
    window.localStorage.setItem("lagMode", document.getElementById("lagCompensationMode").value);
});

let settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'), {
    keyboard: false
});

document.getElementById("settingsButton").addEventListener("click", () => {
    settingsModal.show();
})

async function main() {
    let name = document.getElementById("nameInput").value;
    window.localStorage.setItem("nick", name);

    window.multiplayerAgent = new MultiplayerAgent(window._ROOMADDRESS, {
        player_name: name
    });

    window.multiplayerAgent.lagCompensationMode = document.getElementById("lagCompensationMode").value;
}

document.getElementById("playButton").addEventListener("click", (evt) => {
    document.getElementById("mainMenu").style.display = "none";
    main().then();
})