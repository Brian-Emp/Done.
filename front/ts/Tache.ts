export class Tache {
    public id: number;
    public title: string;
    public estTermine: boolean;

    constructor (tasktitle: string){
        this.title = tasktitle;
        this.estTermine = false;
        this.id = 0;
    }

    public ChangeState(): void {
        this.estTermine = !this.estTermine;
    }
}