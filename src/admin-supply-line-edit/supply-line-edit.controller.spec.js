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

describe('SupplyLineEditController', function() {

    beforeEach(function() {
        module('admin-supply-line-edit');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.SupplyLineDataBuilder = $injector.get('SupplyLineDataBuilder');
            //SELV3-339
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.SupervisoryNodeDataBuilder = $injector.get('SupervisoryNodeDataBuilder');
            this.SupplyLineResource = $injector.get('SupplyLineResource');
            this.loadingModalService = $injector.get('loadingModalService');
            this.confirmService = $injector.get('confirmService');
            this.notificationService = $injector.get('notificationService');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
        });

        this.supplyLine = new this.SupplyLineDataBuilder().buildJson();

        //SELV3-339
        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        //SELV3-339
        this.supervisoryNodes = [
            new this.SupervisoryNodeDataBuilder().build(),
            new this.SupervisoryNodeDataBuilder().build()
        ];

        this.confirmDeferred = this.$q.defer();
        this.saveDeferred = this.$q.defer();

        this.vm = this.$controller('SupplyLineEditController', {
            supplyLine: this.supplyLine,
            //SELV3-339
            facilities: this.facilities,
            supervisoryNodes: this.supervisoryNodes
        });
        this.vm.$onInit();

        //SELV3-339
        spyOn(this.$state, 'go').andReturn();
        spyOn(this.confirmService, 'confirm').andReturn(this.confirmDeferred.promise);
        spyOn(this.loadingModalService, 'open').andReturn(this.$q.resolve());
        spyOn(this.loadingModalService, 'close').andReturn(true);
        spyOn(this.SupplyLineResource.prototype, 'update').andReturn(this.saveDeferred.promise);
        spyOn(this.notificationService, 'success').andReturn();
        spyOn(this.notificationService, 'error').andReturn();
    });

    describe('onInit', function() {

        it('should expose supply line', function() {
            expect(this.vm.supplyLine).toEqual(this.supplyLine);
        });

        it('should expose facilities', function() {
            expect(this.vm.facilities).toEqual(this.facilities);
        });

        it('should expose supervisory nodes', function() {
            expect(this.vm.supervisoryNodes).toEqual(this.supervisoryNodes);
        });
    });

    //SELV3-339
    describe('update', function() {

        it('should call update method', function() {
            this.vm.update(this.supplyLine);

            this.confirmDeferred.resolve();
            this.saveDeferred.resolve(this.supplyLine);
            this.$rootScope.$apply();

            expect(this.confirmService.confirm).toHaveBeenCalledWith(
                'adminSupplyLineEdit.update.confirm', 'adminSupplyLineEdit.update'
            );

            expect(this.loadingModalService.open).toHaveBeenCalled();
            expect(this.SupplyLineResource.prototype.update).toHaveBeenCalledWith(this.supplyLine);
            expect(this.$state.go).toHaveBeenCalled();
            expect(this.notificationService.success)
                .toHaveBeenCalledWith('adminSupplyLineEdit.supplyLineUpdatedSuccessfully');
        });

        it('should not update the supply line if user clicked cancel button', function() {
            this.vm.update(this.supplyLine);

            this.confirmDeferred.reject();
            this.$rootScope.$apply();

            expect(this.SupplyLineResource.prototype.update).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.notificationService.success).not.toHaveBeenCalled();
        });

        it('should show notification if supply line update has failed', function() {
            this.vm.update(this.supplyLine);

            this.confirmDeferred.resolve();
            this.saveDeferred.reject();
            this.$rootScope.$apply();

            expect(this.notificationService.error).toHaveBeenCalledWith('adminSupplyLineEdit.failure');
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });
    });
});