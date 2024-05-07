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

describe('openlmis.requisitions.approvalList', function() {

    beforeEach(function() {
        module('requisition-search');
        module('requisition-approval');
        module('requisition-view-tab');
        module('referencedata-facility');
        module('referencedata-program');
        module('referencedata-period');
        module('referencedata-processing-schedule');

        inject(function($injector) {
            this.$state = $injector.get('$state');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$location = $injector.get('$location');

            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.BATCH_APPROVE_SCREEN_FEATURE_FLAG = $injector.get('BATCH_APPROVE_SCREEN_FEATURE_FLAG');
            this.REQUISITION_STATUS = $injector.get('REQUISITION_STATUS');

            this.requisitionService = $injector.get('requisitionService');
            this.authorizationService = $injector.get('authorizationService');
            this.alertService = $injector.get('alertService');
            this.featureFlagService = $injector.get('featureFlagService');
            this.requisitionSearchService = $injector.get('requisitionSearchService');
            this.requisitionApprovalService = $injector.get('requisitionApprovalService');
            this.permissionService = $injector.get('permissionService');
            this.periodService = $injector.get('periodService');
            this.processingScheduleService = $injector.get('processingScheduleService');

            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
        });

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;

        this.sort = ['emergency,desc', 'authorizedDate,desc'];

        this.requisitions = [
            new this.RequisitionDataBuilder().build(),
            new this.RequisitionDataBuilder().build()
        ];

        this.cachedRequisitions = [
            new this.RequisitionDataBuilder().build(),
            new this.RequisitionDataBuilder().build()
        ];

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

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

        this.user = new this.UserDataBuilder().build();
        //eslint-disable-next-line camelcase
        this.user.user_id = this.user.id;

        this.requisitionsPage = new this.PageDataBuilder()
            .withContent(this.requisitions)
            .build();

        this.cachedRequisitionsPage = new this.PageDataBuilder()
            .withContent(this.cachedRequisitions)
            .build();

        spyOn(this.requisitionService, 'forApproval').andReturn(this.$q.resolve(this.requisitionsPage));
        spyOn(this.requisitionService, 'search').andReturn(this.$q.resolve(this.cachedRequisitionsPage));
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(this.user));
        spyOn(this.featureFlagService, 'get').andReturn(true);
        spyOn(this.alertService, 'error');
        spyOn(this.requisitionApprovalService, 'getPrograms').andReturn(this.$q.resolve(this.programs));
        spyOn(this.requisitionSearchService, 'getFacilities').andReturn(this.$q.resolve(this.facilities));
        spyOn(this.processingScheduleService, 'get').andReturn(this.$q.resolve(this.processingSchedules));
        spyOn(this.permissionService, 'hasRoleWithRightAndFacility').andReturn(this.$q.resolve(true));
    });

    it('should resolve isBatchApproveScreenActive', function() {
        this.goToUrl('/requisitions/approvalList');

        console.log(this.getResolvedValue('isBatchApproveScreenActive'));
        console.log(this.$state.$current.locals.globals);

        expect(this.getResolvedValue('isBatchApproveScreenActive')).toEqual(true);
        expect(this.featureFlagService.get).toHaveBeenCalledWith(this.BATCH_APPROVE_SCREEN_FEATURE_FLAG);
    });

    describe('programs', function() {

        it('should resolve programs', function() {
            this.goToUrl('requisitions/approvalList');

            expect(this.getResolvedValue('programs')).toEqual(this.programs);
            expect(this.requisitionApprovalService.getPrograms).toHaveBeenCalled();
        });

    });

    it('should resolve selected program', function() {
        this.goToUrl('requisitions/approvalList?program=' + this.programs[0].id);

        expect(this.getResolvedValue('selectedProgram')).toEqual(this.programs[0]);
    });

    describe('requisitions', function() {

        //This seems to be a bug breaking this functionality in offline...
        it('should fetch requisitions online if no program filter is specified', function() {
            this.goToUrl('requisitions/approvalList');

            expect(this.getResolvedValue('requisitions')).toEqual(this.requisitions);
            expect(this.requisitionService.search).not.toHaveBeenCalled();
            expect(this.requisitionService.forApproval).toHaveBeenCalledWith({
                page: 0,
                size: 10,
                program: undefined,
                offline: undefined,
                sort: this.sort
            });
        });

        it('should fetch requisitions from cache if when offline', function() {
            this.goToUrl('requisitions/approvalList?offline=true&program=' + this.programs[0].id);

            expect(this.getResolvedValue('requisitions')).toEqual(this.cachedRequisitions);
            expect(this.requisitionService.forApproval).not.toHaveBeenCalledWith();
            expect(this.requisitionService.search).toHaveBeenCalledWith(true, {
                page: 0,
                size: 10,
                program: this.programs[0].id,
                offline: 'true',
                sort: this.sort,
                requisitionStatus: [
                    this.REQUISITION_STATUS.AUTHORIZED,
                    this.REQUISITION_STATUS.IN_APPROVAL
                ],
                showBatchRequisitions: true
            });
        });

        it('should fetch requisitions when offline and program filter is specified', function() {
            this.goToUrl('requisitions/approvalList?program=' + this.programs[0].id);

            expect(this.getResolvedValue('requisitions')).toEqual(this.requisitions);
            expect(this.requisitionService.search).not.toHaveBeenCalled();
            expect(this.requisitionService.forApproval).toHaveBeenCalledWith({
                page: 0,
                size: 10,
                program: this.programs[0].id,
                offline: undefined,
                facility: undefined,
                processingSchedule: undefined,
                processingPeriod: undefined,
                sort: this.sort
            });
        });

    });

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }

});
