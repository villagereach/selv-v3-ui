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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name referencedata-requisition-group.RequisitionGroup
     *
     * @description
     * Represents a single stock requisitionGroup.
     */
    angular
        .module('referencedata-requisition-group')
        .factory('RequisitionGroup', RequisitionGroup);

    RequisitionGroup.$inject = ['$q'];

    function RequisitionGroup($q) {
        RequisitionGroup.prototype.addFacility = addFacility;
        RequisitionGroup.prototype.removeFacility = removeFacility;
        RequisitionGroup.prototype.validateFacilityExists = validateFacilityExists;
        RequisitionGroup.prototype.isFacilityDuplicated = isFacilityDuplicated;
        RequisitionGroup.prototype.validateFacilityDoesNotExist = validateFacilityDoesNotExist;
        RequisitionGroup.prototype.addProgramSchedule = addProgramSchedule;
        RequisitionGroup.prototype.removeProgramSchedule = removeProgramSchedule;
        RequisitionGroup.prototype.validateProgramScheduleExists = validateProgramScheduleExists;
        RequisitionGroup.prototype.isProgramScheduleDuplicated = isProgramScheduleDuplicated;
        RequisitionGroup.prototype.validateProgramScheduleDoesNotExist = validateProgramScheduleDoesNotExist;
        return RequisitionGroup;

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.RequisitionGroup
         * @name RequisitionGroup
         *
         * @description
         * Creates a new instance of the RequisitionGroup class.
         *
         * @param  {Object}                json       the JSON representation of the RequisitionGroup
         * @return {RequisitionGroup}                           the RequisitionGroup object
         */
        function RequisitionGroup(json) {
            if (!json) {
                json = {};
            }

            this.id = json.id;
            this.code = json.code;
            this.name = json.name;
            this.description = json.description;
            this.supervisoryNode = json.supervisoryNode;
            this.memberFacilities = json.memberFacilities ? json.memberFacilities : [];
            this.requisitionGroupProgramSchedules = json.requisitionGroupProgramSchedules
                ? json.requisitionGroupProgramSchedules
                : [];
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.RequisitionGroup
         * @name addFacility
         *
         * @description
         * Adds the given facility to the list of requisitionGroup facility. Also stores information if
         * the facility has been previously removed and not saved. If an already existing
         * facility is added this method will return a rejected promise.
         *
         * @param  {Object}  facility the facility to add
         * @return {Promise}            the promise resolved when facility was successfully added
         */
        function addFacility(facility) {
            var error = this.validateFacilityDoesNotExist(facility);
            if (error) {
                return $q.reject(error);
            }

            this.memberFacilities.push(facility);

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.RequisitionGroup
         * @name removeFacility
         *
         * @description
         * Removes the given facility from the list of requisitionGroup memberFacilities. Also stores information
         * if the facility has been previously added and not saved.
         *
         * @param {Object} facility the facility to be removed
         */
        function removeFacility(facility) {
            var error = this.validateFacilityExists(facility);
            if (error) {
                return $q.reject(error);
            }

            var index = this.memberFacilities.findIndex(function(existing) {
                return existing.id === facility.id;
            });
            this.memberFacilities.splice(index, 1);
            return $q.resolve();
        }

        function validateFacilityDoesNotExist(facility) {
            if (this.isFacilityDuplicated(facility)) {
                return 'requisitionGroupAdd.facilityDuplicated';
            }
        }

        function validateFacilityExists(facility) {
            var index = this.memberFacilities.findIndex(function(existing) {
                return existing.id === facility.id;
            });
            if (index === -1) {
                return 'requisitionGroupAdd.facilityNotAdded';
            }
        }

        function isFacilityDuplicated(newFacility) {
            return this.memberFacilities.filter(function(facility) {
                return facility.id === newFacility.id;
            }).length;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.RequisitionGroup
         * @name addProgramSchedule
         *
         * @description
         * Adds the given program and schedule to the list of requisitionGroup program schedules.
         * Also stores information if
         * the program and schedule has been previously removed and not saved.
         * If an already existing
         * program and schedule is added this method will return a rejected promise.
         *
         * @param  {Object}  programSchedule the program schedule to add
         * @return {Promise}  the promise resolved when program and schedule was successfully added
         */
        function addProgramSchedule(programSchedule) {
            var error = this.validateProgramScheduleDoesNotExist(
                programSchedule.program,
                programSchedule.processingSchedule
            );
            if (error) {
                return $q.reject(error);
            }
            this.requisitionGroupProgramSchedules.push(programSchedule);

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-requisition-group.RequisitionGroup
         * @name removeProgramSchedule
         *
         * @description
         * Removes the given programSchedule from the list of requisitionGroup programSchedules. Also stores information
         * if the programSchedule has been previously added and not saved.
         *
         * @param {Object} programSchedule the programSchedule to be removed
         */
        function removeProgramSchedule(programSchedule) {
            var program = programSchedule.program;
            var schedule = programSchedule.processingSchedule;

            var error = this.validateProgramScheduleExists(program, schedule);
            if (error) {
                return $q.reject(error);
            }

            var index = this.requisitionGroupProgramSchedules.findIndex(function(existing) {
                return (existing.program.id === program.id) && (existing.processingSchedule.id === schedule.id);
            });
            this.requisitionGroupProgramSchedules.splice(index, 1);
            return $q.resolve();
        }

        function validateProgramScheduleDoesNotExist(program, schedule) {
            if (this.isProgramScheduleDuplicated(program, schedule)) {
                return 'requisitionGroupAdd.programScheduleDuplicated';
            }
        }

        function validateProgramScheduleExists(program, schedule) {
            var index = this.requisitionGroupProgramSchedules.findIndex(function(existing) {
                return (existing.program.id === program.id) && (existing.processingSchedule.id === schedule.id);
            });
            if (index === -1) {
                return 'requisitionGroupAdd.programScheduleNotAdded';
            }
        }

        function isProgramScheduleDuplicated(program, schedule) {
            return this.requisitionGroupProgramSchedules.filter(function(existing) {
                return (existing.program.id === program.id) && (existing.processingSchedule.id === schedule.id);
            }).length;
        }
    }

})();
