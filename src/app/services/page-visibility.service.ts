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

import { Injectable, EventEmitter } from '@angular/core';


/* Returns true iff the page is visible to the user */
function isPageVisible() : boolean
{
    return (
        (document.hidden !== undefined && !document.hidden) ||
        (document.msHidden !== undefined && !document.msHidden) ||
        (document.webkitHidden !== undefined && !document.webkitHidden)
    );
}

/*
 * Returns the event name that fires when the page visibility state changes.
 * (or empty string if there is no such event)
 */
function getVisibilityChangeEventName() : string
{
    if (document.hidden !== undefined) return 'visibilitychange';
    if (document.msHidden !== undefined) return 'msvisibilitychange';
    if (document.webkitHidden !== undefined) return 'webkitvisibilitychange'
    return '';
}


@Injectable({
    providedIn: 'root'
})
export class PageVisibilityService
{
    change : EventEmitter<boolean> = new EventEmitter();

    constructor()
    {
        const event = getVisibilityChangeEventName();
        if (event !== '')
        {
            document.addEventListener(event, () => {
                this.change.emit(isPageVisible());
            }, false);
        }
    }
}
