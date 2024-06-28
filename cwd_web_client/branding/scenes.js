class Scene {
    constructor(body) {
        this.body = body;
        this.active = this.body.classList.contains('active');
        this.next = null;
        this.nextOffset = 0;

        if (this.active) {
            this.activate();
        }
    }

    activate() {
        this.active = true;
        this.body.classList.add('active');
    }

    async deactivate() {
        if (this.next) {
            this.next.activate();
        }

        if (this.nextOffset !== 0) {
            await timeout(this.nextOffset);
        }

        this.active = false;
        this.body.classList.remove('active');
    }
}

class TerminalScene extends Scene {
    activate() {
        super.activate();

        this.cursor = this.body.querySelector('.terminal__prompt__cursor');
        this.blinkInterval = setInterval(this.blinkCursor.bind(this), 500);

        this.inputField = this.body.querySelector('.terminal__prompt__input');
        setTimeout(this.startTyping.bind(this), 2000);
    }

    deactivate() {
        super.deactivate();

        clearInterval(this.blinkInterval);
    }

    
    // === Terminal Specific Functions (in order of use) ===

    blinkCursor() {
        if (this.cursor.classList.contains('visible')) {
            this.cursor.classList.remove('visible');
        } else {
            this.cursor.classList.add('visible');
        }
    }

    async startTyping() {
        let input_phrase = "./start";
        let timeout_increment = 250;

        for (let idx in input_phrase) {
            this.inputField.innerText += input_phrase[idx];
            await timeout(timeout_increment);

            if (input_phrase[idx] === "/") {
                await timeout(timeout_increment);
                await timeout(timeout_increment);
            }
        }

        await timeout(timeout_increment);
        await timeout(timeout_increment);

        this.deactivate();
    }
}


class MatrixScene extends Scene {
    activate() {
        super.activate();

        this.canvas = document.getElementById('matrixCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()_+=-{}[]|\\:;'<>,.?/";
        this.fontSize = 20;
        this.columns = (this.canvas.width / this.fontSize) + 1;

        // Creating a drops array which keeps track of the y-coordinate of the symbol in each column
        this.drops = new Array(Math.floor(this.columns)).fill(0);

        this.draw();

        // we don't want this scene to dissappear
        if (this.next) {
            setTimeout(this.next.activate.bind(this.next), 5000);
        }
    }

    draw() {
        this.ctx.fillStyle = '#1a2b4230';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        this.ctx.fillStyle = '#5cc59e'; // Green text
        this.ctx.font = this.fontSize + 'px monospace';
    
        for (let i = 0; i < this.drops.length; i++) {
            const text = this.symbols.charAt(Math.floor(Math.random() * this.symbols.length));
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
    
            // Sending the drop back to the top randomly after it has crossed the screen
            // Adding a randomness to the reset to make the drops scattered on the Y axis
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
    
            // Incrementing Y coordinate
            this.drops[i]++;
        }
        
        if (this.active) {
            requestAnimationFrame(this.draw.bind(this));
        }
    }
}

class LogoScene extends Scene {
    async activate() {
        super.activate();

        this.logo_parts = this.body.querySelectorAll(".logo__parts img");
        this.logo_branding = this.body.querySelector('.logo__branding');

        let parts_range = range(this.logo_parts.length);

        for (let i in parts_range) {
            let parse_i = parseInt(i);
            this.logo_parts[parse_i].classList.add('visible');

            if (i < 2) {
                await timeout(500);
            } else {
                await timeout(400);
            }
        }

        this.logo_branding.classList.add('visible');
    }
}
