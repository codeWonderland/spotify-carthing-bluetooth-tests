document.addEventListener("DOMContentLoaded", () => {

    let scenes = [
        new TerminalScene(document.querySelector(".scene.scene--terminal")),
        new MatrixScene(document.querySelector(".scene.scene--matrix")),
        new LogoScene(document.querySelector(".scene.scene--logo")),
    ];

    let scene_range = range(scenes.length);
    
    for (let i in scene_range) {
        let parsed_i = parseInt(i);
        if (parsed_i + 1 < scenes.length) {
            scenes[i].next = scenes[parsed_i + 1];
        }
    }
});