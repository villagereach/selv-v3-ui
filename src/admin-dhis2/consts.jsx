/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

export const CRON_EXPRESSION_OPTIONS = [
    { name: 'MONTHLY', value: 'MONTHLY' },
    { name: 'WEEKLY', value: 'WEEKLY' },
    { name: 'DAILY', value: 'DAILY' }
];

export const WEEKLY_OPTIONS = [
    { name: 'MONDAY', value: '1'},
    { name: 'TUESDAY', value: '2'},
    { name: 'WEDNESDAY', value: '3'},
    { name: 'THURSDAY', value: '4'},
    { name: 'FRIDAY', value: '5'},
    { name: 'SATURDAY', value: '6'},
    { name: 'SUNDAY', value: '7'}
];

export const SOURCE_OPTIONS = [
    { name: 'Requisition', value: 'REQUISITION'}
];

export const DAY_OPTIONS = 30;
export const HOUR_OPTIONS = 23;
export const MINUTE_OPTIONS = 59;
