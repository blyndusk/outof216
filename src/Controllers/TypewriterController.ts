import UserModel from '../Models/UserModel';
import UserView from '../Views/UserView';
import UserController from '../Controllers/UserController';

import ClockModel from '../Models/ClockModel';
import ClockView from '../Views/ClockView';
import ClockController from '../Controllers/ClockController';

import ph from '../placeholders';

import { writeUserData } from '../db';

export default class TypewriterController {
    private model: any;
    private view: any;
    private seconds: number;
    private isWordFinished: boolean;
    private hasToBeCorrected: boolean;
    private userM: any;
    private userV: any;
    private userC: any;
    private clockM: any;
    private clockV: any;
    private clockC: any;
    constructor(model: any, view: any) {
        this.model = model;
        this.view = view;
        this.seconds = 10;
        this.isWordFinished = false;
        this.hasToBeCorrected = false;
        this.userM = new UserModel(ph.user, []);
        this.userV = new UserView(document.querySelector('#user'));
        this.userC = new UserController(this.userM, this.userV);
        this.clockM = new ClockModel(this.seconds);
        this.clockV = new ClockView(document.querySelector('#timer'));
        this.clockC = new ClockController(this.clockM, this.clockV);
    }
    public updateView() {
        this.userC.updateView();
        this.clockC.updateView();
        return this.view.display(
            this.model.getWords(),
            this.isWordFinished,
            this.hasToBeCorrected,
        );
    }
    public handleKeys() {
        let isStarted = false;
        let i: number = 0;
        return window.addEventListener('keydown', (e) => {
            if (this.seconds <= 1) {
                setTimeout(() => {
                    return;
                }, 1000);
            }
            const USER = this.userM.getUser();
            if (!isStarted) {
                this.setTimer();
                isStarted = true;
            }
            if (e.key === this.model.getWords()[0][i]) {
                this.stylizeLetter('right', i);
                i++;
                if (i === this.model.getWords()[0].length) {
                    this.isWordFinished = true;
                }
            } else {
                if (e.code === 'Space') {
                    USER.words.count++;
                    if (this.isWordFinished) {
                        this.removeFirstWord();
                        USER.words.success++;
                        USER.WPM++;
                        this.userM.setUser(USER);
                    } else {
                        this.removeFirstWord();
                        USER.words.fail++;
                        this.userM.setUser(USER);
                    }
                    USER.words.ratio = USER.words.success / USER.words.count;
                    this.isWordFinished = false;
                    i = 0;
                } else if (e.code === 'Backspace') {
                    if (!this.isWordFinished && this.hasToBeCorrected) {
                        this.letterCorrection(i);
                        this.hasToBeCorrected = false;
                    }
                } else {
                    if (!this.isWordFinished) {
                        this.stylizeLetter('wrong', i);
                        this.hasToBeCorrected = true;
                    }
                }
            }
            this.updateView();
        });
    }
    private stylizeLetter(type: string, i: number) {
        switch (type) {
            case 'right':
                return this.model.getWords()[0][i] = `<i style="color:#23b923;">${this.model.getWords()[0][i]}</i>`;
            case 'wrong':
                return this.model.getWords()[0][i] = `<i style="color:#b92323;">${this.model.getWords()[0][i]}</i>`;
            case 'correct':
                return this.model.getWords()[0][i] = this.model.getWords()[0][i]
                    .match(/>[a-z]/g)
                    .join()
                    .replace('>', '');
        }
        return this.model.setWords(this.model.getWords());
    }
    private removeFirstWord() {
        this.model.getWords().shift();
        this.model.setWords(this.model.getWords());
    }
    private letterCorrection(i: number) {
        this.stylizeLetter('correct', i);
    }
    private setTimer() {
        const timer = setInterval(() => {
            this.seconds--;
            this.clockM.setSeconds(this.seconds);
            this.clockC.updateView();
            if (this.seconds <= 0) {
                clearInterval(timer);
                writeUserData(this.userM.getUser());
                return this.userM.getProgression().push({
                    user: this.userM.getUser(),
                });
            }
        }, 1000);
    }
}
