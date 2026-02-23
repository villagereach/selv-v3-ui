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

describe('selvRequisitionApprovalService', function() {

    beforeEach(function() {

        var context = this;

        module('requisition-view-tab');
        module('selv-requisition-approval-list');

        inject(function($injector) {
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');

            this.$rootScope = $injector.get('$rootScope');
            this.requisitionService = $injector.get('requisitionService');
            this.selvRequisitionApprovalService = $injector.get('selvRequisitionApprovalService');
            this.REQUISITION_STATUS = $injector.get('REQUISITION_STATUS');
            this.$q = $injector.get('$q');
        });

        this.requisition1 = new this.RequisitionDataBuilder().build();
        this.requisition2 = new this.RequisitionDataBuilder().build();
        this.requisition3 = new this.RequisitionDataBuilder().build();
        this.requisition4 = new this.RequisitionDataBuilder().build();

        this.programId = 'program-1';
        this.processingPeriodId = 'period-1';
        this.supervisoryNodeId1 = 'node-1';
        this.supervisoryNodeId2 = 'node-2';

        spyOn(this.requisitionService, 'search')
            .andCallFake(function(offline, queryParams) {
                if (queryParams.supervisoryNode === context.supervisoryNodeId1) {
                    return context.$q.resolve({
                        content: [context.requisition1, context.requisition2]
                    });
                }
                return context.$q.resolve({
                    content: [context.requisition3, context.requisition4]
                });
            });
    });

    describe('getRequisitionsForApproval', function() {

        var result;

        beforeEach(function() {
            this.selvRequisitionApprovalService.getRequisitionsForApproval(
                this.programId,
                this.processingPeriodId,
                [this.supervisoryNodeId1, this.supervisoryNodeId2]
            ).then(function(response) {
                result = response;
            });

            this.$rootScope.$apply();
        });

        it('should call requisitionService twice', function() {
            expect(this.requisitionService.search)
                .toHaveBeenCalledWith(false, {
                    requisitionStatus: [
                        this.REQUISITION_STATUS.AUTHORIZED,
                        this.REQUISITION_STATUS.IN_APPROVAL
                    ],
                    program: this.programId,
                    processingPeriod: this.processingPeriodId,
                    supervisoryNode: this.supervisoryNodeId1
                });

            expect(this.requisitionService.search)
                .toHaveBeenCalledWith(false, {
                    requisitionStatus: [
                        this.REQUISITION_STATUS.AUTHORIZED,
                        this.REQUISITION_STATUS.IN_APPROVAL
                    ],
                    program: this.programId,
                    processingPeriod: this.processingPeriodId,
                    supervisoryNode: this.supervisoryNodeId2
                });
        });

        it('should return all requisitions combined', function() {
            expect(result).toEqual([this.requisition1, this.requisition2, this.requisition3, this.requisition4]);
        });
    });
});