const gamepadConfig = {
    useAxisAsDpad: true,
    dpadAxisThreshold: 0.7,
    axisDeadZone: 0.1,
};

const DPAD_UP = 12;
const DPAD_DOWN = 13;
const DPAD_LEFT = 14;
const DPAD_RIGHT = 15;

const BUTTON_START = 11;
const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_X = 3;
const BUTTON_Y = 4;

const buttonStates = {};
const gamepadEvents = {
    pressDown: (button) => {},
    pressUp: (button) => {},
    pressed: (button) => {},
};

((gamepadConfig, buttonStates, gamepadEvents) => {
    const haveEvents = 'ongamepadconnected' in window;
    const controllers = {};

    function connecthandler(e) {
        addgamepad(e.gamepad);
    }

    function addgamepad(gamepad) {
        controllers[gamepad.index] = gamepad;
        gamepad.buttons.forEach((button, i) => {
        });

        gamepad.axes.forEach((axis, i) => {
        });

        console.log(`add controller ${gamepad.index}`, gamepad);
        requestAnimationFrame(updateStatus);
    }

    function disconnecthandler(e) {
        removegamepad(e.gamepad);
    }

    function removegamepad(gamepad) {
        delete controllers[gamepad.index];
    }

    function updateStatus() {
        if (!haveEvents) {
            scangamepads();
        }

        const prevBtnStates = Object.assign({}, buttonStates);
        for (const btn in buttonStates) {
            buttonStates[btn] = false;
        }

        // console.log('prevBtnStates', prevBtnStates);

        for (const controllerId in controllers) {
            const controller = controllers[controllerId];
            controller.buttons.forEach((button, i) => {
                let pressed = button === 1.0;
                let val = button;

                if (typeof button === "object") {
                    pressed = val.pressed;
                    val = val.value;
                }

                if (pressed) {
                    if (!prevBtnStates[i]) {
                        console.log(`pressdown ${i}`);
                        gamepadEvents.pressDown(i);
                    }
                    console.log(`button ${i} pressed`);
                    gamepadEvents.pressed(i);
                    buttonStates[i] = true;
                }
            });

            for (let axisNum = 0; axisNum < controller.axes.length; axisNum++) {
                if (gamepadConfig.useAxisAsDpad) {
                    const value = controller.axes[axisNum];
                    const pressed = Math.abs(value) >= gamepadConfig.dpadAxisThreshold && Math.abs(value) <= 1;
                    if (pressed) {
                        let dpad;
                        // console.log(`axe ${axisNum} = `, controller.axes[axisNum]);
                        switch (axisNum) {
                            case 0:
                                dpad = value < 0 ? DPAD_LEFT : DPAD_RIGHT;
                                buttonStates[dpad] = true;
                                break;
                            case 1:
                                dpad = value < 0 ? DPAD_UP : DPAD_DOWN;
                                buttonStates[dpad] = true;
                                break;
                            default:
                                break;
                        }
                        if (!prevBtnStates[dpad]) {
                            //pressdown
                            console.log(`pressdown ${dpad}`);
                            gamepadEvents.pressDown(dpad);
                        }
                        console.log(`button ${dpad} pressed`);
                        gamepadEvents.pressed(dpad);
                    }
                }
            }

            for (const btn in buttonStates) {
                if (!buttonStates[btn] && prevBtnStates[btn]) {
                    // press up
                    console.log(`pressup ${btn}`);
                    gamepadEvents.pressUp(btn);
                }
            }
        }

        requestAnimationFrame(updateStatus);
    }

    function scangamepads() {
        const gamepads = navigator.getGamepads();
        for (const gamepad of gamepads) {
            if (gamepad) { // Can be null if disconnected during the session
                if (gamepad.index in controllers) {
                    controllers[gamepad.index] = gamepad;
                } else {
                    addgamepad(gamepad);
                }
            }
        }
    }

    window.addEventListener("gamepadconnected", connecthandler);
    window.addEventListener("gamepaddisconnected", disconnecthandler);

    if (!haveEvents) {
        setInterval(scangamepads, 500);
    }
})(gamepadConfig, buttonStates, gamepadEvents);