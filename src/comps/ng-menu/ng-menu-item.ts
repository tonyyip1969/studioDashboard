import {Component, ChangeDetectionStrategy, Input} from "@angular/core";
import {Compbaser} from "../compbaser/Compbaser";
import {NgMenu} from "./ng-menu";

@Component({
    selector: 'ng-menu-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            
           `,
})
export class NgMenuItem extends Compbaser {

    constructor(private ngMenu:NgMenu) {
        super();
        this.ngMenu.addMenuItem(this);
    }

    @Input() fontawesome:string;
    @Input() title:string;

    get getTitle(): string {
        return this.title;
    }

    get getFontAwesome(): string {
        return this.fontawesome;
    }


    ngOnInit() {
    }

    destroy() {
    }
}