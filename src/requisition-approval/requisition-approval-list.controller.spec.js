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

describe('RequisitionApprovalListController', function() {

    //injects
    var requisitionsStorage, batchRequisitionsStorage;

    beforeEach(function() {
        module('requisition-approval');
        module('referencedata-facility');
        module('referencedata-program');

        module(function($provide) {
            requisitionsStorage = jasmine.createSpyObj('requisitionsStorage', ['search', 'put', 'getBy', 'removeBy']);
            batchRequisitionsStorage = jasmine.createSpyObj('batchRequisitionsStorage', ['search', 'put', 'getBy',
                'removeBy']);

            var offlineFlag = jasmine.createSpyObj('offlineRequisitions', ['getAll']);
            offlineFlag.getAll.andReturn([false]);
            var localStorageFactorySpy = jasmine.createSpy('localStorageFactory').andCallFake(function(resourceName) {
                if (resourceName === 'offlineFlag') {
                    return offlineFlag;
                }
                if (resourceName === 'batchApproveRequisitions') {
                    return batchRequisitionsStorage;
                }
                return requisitionsStorage;
            });

            $provide.service('localStorageFactory', function() {
                return localStorageFactorySpy;
            });
        });

        inject(function($injector) {

            this.$controller = $injector.get('$controller');
            this.$stateParams = $injector.get('$stateParams');
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.alertService = $injector.get('alertService');
            this.periodService = $injector.get('periodService');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
        });

        this.programs = [{
            id: '1',
            code: 'PRG001',
            name: 'Family Planning'
        },
        {
            id: '2',
            code: 'PRG002',
            name: 'Essential Meds'
        }];

        this.facilities = [
            {
                id: '1',
                name: 'first facility',
                code: 'first code'
            },
            {
                id: '2',
                name: 'second facility',
                code: 'second code'
            }
        ];

        this.processingSchedules = {
            content: [
                {
                    id: '1',
                    code: 'code_1',
                    name: 'Code 1'
                }
            ]
        };

        this.requisitions = [
            {
                id: 1,
                facility: {
                    id: '1',
                    name: 'first facility',
                    code: 'first code'
                },
                program: this.programs[0]

            },
            {
                id: 2,
                facility: {
                    id: '2',
                    name: 'second facility',
                    code: 'second code'
                },
                program: this.programs[1]

            }
        ];
    });

    describe('$onInit', function() {

        beforeEach(function() {
            this.vm = this.$controller('RequisitionApprovalListController', {
                requisitions: this.requisitions,
                programs: this.programs,
                selectedProgram: this.programs[0],
                facilities: this.facilities,
                selectedFacility: this.facilities[0],
                processingSchedules: this.processingSchedules.content,
                selectedProcessingSchedule: this.processingSchedules.content[0],
                isBatchApproveScreenActive: true,
                $scope: this.scope
            });

            spyOn(this.scope, '$watch').andCallThrough();
        });

        it('should expose requisitions', function() {
            this.$rootScope.$apply();

            this.vm.$onInit();

            expect(this.vm.requisitions).toBe(this.requisitions);
        });

        it('should expose programs', function() {
            this.vm.$onInit();

            expect(this.vm.programs).toBe(this.programs);
        });

        it('should expose selected program', function() {
            this.vm.$onInit();

            expect(this.vm.selectedProgram).toBe(this.programs[0]);
        });

        it('should expose offline flag', function() {
            this.vm.$onInit();

            expect(this.vm.offline).toBe(false);
        });

        it('should expose isBatchApproveScreenActive flag', function() {
            this.vm.$onInit();

            expect(this.vm.isBatchApproveScreenActive).toBe(true);
        });

        it('should expose sort options', function() {
            expect(this.vm.options).toEqual({
                'requisitionApproval.newestAuthorized': ['emergency,desc', 'authorizedDate,desc'],
                'requisitionApproval.oldestAuthorized': ['emergency,desc', 'authorizedDate,asc']
            });
        });
    });

    describe('search', function() {

        beforeEach(function() {
            this.vm = this.$controller('RequisitionApprovalListController', {
                requisitions: this.requisitions,
                programs: this.programs,
                selectedProgram: this.programs[0],
                facilities: this.facilities,
                selectedFacility: this.facilities[0],
                processingSchedules: this.processingSchedules.content,
                selectedProcessingSchedule: this.processingSchedules.content[0],
                isBatchApproveScreenActive: true,
                $scope: this.scope
            });

            spyOn(this.$state, 'go');
        });

        it('should set program', function() {
            this.vm.selectedProgram = this.programs[0];
            this.vm.offline = false;

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.approvalList', {
                program: this.vm.selectedProgram.id,
                facility: null,
                processingSchedule: null,
                processingPeriod: null,
                offline: false
            }, {
                reload: true
            });
        });

        it('should set offline flag correctly', function() {
            this.vm.selectedProgram = this.programs[0];
            this.vm.offline = true;

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.approvalList', {
                program: this.vm.selectedProgram.id,
                facility: null,
                processingSchedule: null,
                processingPeriod: null,
                offline: true
            }, {
                reload: true
            });
        });

        it('should reload state', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });

    describe('openRnr', function() {

        beforeEach(function() {
            this.vm = this.$controller('RequisitionApprovalListController', {
                requisitions: this.requisitions,
                programs: this.programs,
                selectedProgram: this.programs[0],
                facilities: this.facilities,
                selectedFacility: this.facilities[0],
                processingSchedules: this.processingSchedules.content,
                selectedProcessingSchedule: this.processingSchedules.content[0],
                isBatchApproveScreenActive: true,
                $scope: this.scope
            });

            spyOn(this.$state, 'go');
        });

        it('should go to fullSupply state', function() {
            this.vm.openRnr(this.requisitions[0].id);

            // SELV3-126: Increases pagination size of requisition forms from 10 to 25 items
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
                rnr: this.requisitions[0].id,
                fullSupplyListSize: 25
            });
            // SELV3-126: ends here
        });
    });

    describe('viewSelectedRequisitions', function() {

        beforeEach(function() {
            this.vm = this.$controller('RequisitionApprovalListController', {
                requisitions: this.requisitions,
                programs: this.programs,
                selectedProgram: this.programs[0],
                facilities: this.facilities,
                selectedFacility: this.facilities[0],
                processingSchedules: this.processingSchedules.content,
                selectedProcessingSchedule: this.processingSchedules.content[0],
                isBatchApproveScreenActive: true,
                $scope: this.scope
            });

            spyOn(this.$state, 'go');
            spyOn(this.alertService, 'error');
        });

        it('should show error when trying to call with no requisition selected', function() {
            this.vm.viewSelectedRequisitions();

            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.alertService.error).toHaveBeenCalledWith('requisitionApproval.selectAtLeastOneRnr');
        });

        it('should show error when trying to call with requisition selected from two different programs', function() {
            this.vm.selectedProgram = undefined;
            this.requisitions[0].$selected = true;
            this.requisitions[1].$selected = true;

            this.vm.requisitions = this.requisitions;

            this.vm.viewSelectedRequisitions();

            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.alertService.error)
                .toHaveBeenCalledWith('requisitionApproval.selectRequisitionsFromTheSameProgram');
        });

        it('should not show error when trying to call with requisition selected', function() {
            this.requisitions[0].$selected = true;

            this.vm.requisitions = this.requisitions;

            this.vm.viewSelectedRequisitions();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.batchApproval', {
                ids: [ this.vm.requisitions[0].id ].join(',')
            });

            expect(this.alertService.error).not.toHaveBeenCalled();
        });

    });

});
