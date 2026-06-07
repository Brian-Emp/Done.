export class Tache {
    id;
    title;
    estTermine;
    constructor(tasktitle) {
        this.title = tasktitle;
        this.estTermine = false;
        this.id = 0;
    }
    ChangeState() {
        this.estTermine = !this.estTermine;
    }
}
