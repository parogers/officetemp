/*
 * Office Temper - A game about temp work.
 * Copyright (C) 2020  Peter Rogers (peter.rogers@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { Component, ViewChild } from '@angular/core';

import { Application } from './game/main';

import { PageVisibilityService } from './services/page-visibility.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent
{
    @ViewChild('gameArea', { static: true })
    gameArea : any;

    application : Application;

    constructor(
        private visibilityService : PageVisibilityService,
    )
    {
        this.application = new Application();
        this.visibilityService.change.subscribe(visible => {
            if (visible) {
                this.application.resume();
            } else {
                this.application.pause();
            }
        });
    }

    ngOnInit()
    {
        this.application.start(this.gameArea.nativeElement);
    }
}
