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

describe('ProofOfDeliveryManageController', function() {

    var proofOfDeliveryManageService, $rootScope, $state, $q, $controller, ProgramDataBuilder, FacilityDataBuilder,
        ProofOfDeliveryDataBuilder, vm, deferred, pod, stateParams, supplyingFacilities, programs, requestingFacilities,
        loadingModalService, notificationService, loadingDeferred, $window, accessTokenFactory;

    beforeEach(function() {
        module('proof-of-delivery-manage', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            deferred = $q.defer();
            $window = $injector.get('$window');
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            proofOfDeliveryManageService = $injector.get('proofOfDeliveryManageService');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            ProofOfDeliveryDataBuilder = $injector.get('ProofOfDeliveryDataBuilder');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            accessTokenFactory = $injector.get('accessTokenFactory');

        });

        pod = new ProofOfDeliveryDataBuilder().build();
        requestingFacilities = [
            new FacilityDataBuilder().build(),
            new FacilityDataBuilder().build()
        ];
        supplyingFacilities = [
            new FacilityDataBuilder().build(),
            new FacilityDataBuilder().build()
        ];
        programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];
        stateParams = {
            page: 0,
            size: 10,
            programId: programs[0].id,
            requestingFacilityId: requestingFacilities[0].id,
            supplyingFacilityId: supplyingFacilities[0].id
        };

        vm = $controller('ProofOfDeliveryManageController', {
            programs: programs,
            requestingFacilities: requestingFacilities,
            supplyingFacilities: supplyingFacilities,
            pods: [pod],
            $stateParams: stateParams
        });

        loadingDeferred = $q.defer();

        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');
        spyOn($window, 'open').andCallThrough();

        spyOn(accessTokenFactory, 'addAccessToken').andCallThrough();
        spyOn(loadingModalService, 'open').andReturn(loadingDeferred.promise);
    });

    describe('onInit', function() {

        it('should expose pod', function() {
            vm.$onInit();

            expect(vm.pods).toEqual([pod]);
        });

        it('should expose programs', function() {
            vm.$onInit();

            expect(vm.programs).toEqual(programs);
        });

        it('should expose requesting facilities', function() {
            vm.$onInit();

            expect(vm.requestingFacilities).toEqual(requestingFacilities);
        });

        it('should expose supplying facilities', function() {
            vm.$onInit();

            expect(vm.supplyingFacilities).toEqual(supplyingFacilities);
        });

        it('should select program', function() {
            vm.$onInit();

            expect(vm.program).toEqual(programs[0]);
        });

        it('should select requesting facility', function() {
            vm.$onInit();

            expect(vm.requestingFacility).toEqual(requestingFacilities[0]);
        });

        it('should select supplying facility', function() {
            vm.$onInit();

            expect(vm.supplyingFacility).toEqual(supplyingFacilities[0]);
        });

        it('should set program name', function() {
            vm.$onInit();

            expect(vm.facilityName).toEqual(vm.requestingFacility.name);
        });

        it('should set facility name', function() {
            vm.$onInit();

            expect(vm.programName).toEqual(vm.program.name);
        });

        it('should set periodStartDate if period start date from was passed through the URL', function() {
            this.$stateParams.periodStartDate = '2017-01-31';

            this.vm.$onInit();

            expect(this.vm.periodStartDate).toEqual('2017-01-31');
        });

        it('should not set periodStartDate if period start date from not passed through the URL', function() {
            this.$stateParams.periodStartDate = undefined;

            this.vm.$onInit();

            expect(this.vm.periodStartDate).toBeUndefined();
        });

        it('should set periodEndDate if period end date to was passed through the URL', function() {
            this.$stateParams.periodEndDate = '2017-01-31';

            this.vm.$onInit();

            expect(this.vm.periodEndDate).toEqual('2017-01-31');
        });

        it('should not set periodEndDate if period end date to not passed through the URL', function() {
            this.$stateParams.periodEndDate = undefined;

            this.vm.$onInit();

            expect(this.vm.periodEndDate).toBeUndefined();
        });

        it('should set status if it was selected', function() {
            this.$stateParams.status = this.orderStatuses[2].value;

            this.vm.$onInit();

            expect(this.vm.status).toBe(this.vm.orderStatuses[2]);
        });

        it('should call watch', function() {
            this.vm.$onInit();

            this.vm.supplyingFacility = this.supplyingFacilities[0];
            this.$rootScope.$apply();

            expect(this.scope.$watch).toHaveBeenCalled();
            expect(this.vm.requestingFacilities).toEqual([this.requestingFacilities[0], this.requestingFacilities[1]]);
            expect(this.requestingFacilityFactory.loadRequestingFacilities)
                .toHaveBeenCalledWith(this.supplyingFacilities[0].id);

            this.vm.supplyingFacility = this.supplyingFacilities[1];
            this.$rootScope.$apply();

            expect(this.scope.$watch).toHaveBeenCalled();
            expect(this.vm.requestingFacilities).toEqual([this.requestingFacilities[2]]);
            expect(this.requestingFacilityFactory.loadRequestingFacilities)
                .toHaveBeenCalledWith(this.supplyingFacilities[1].id);
        });
    });

    it('loadOrders should reload state with right params', function() {
        spyOn($state, 'go');

        vm.requestingFacility =  {
            id: 'facility-one'
        };
        vm.supplyingFacility =  {
            id: 'facility-two'
        };
        vm.program = {
            id: 'program-one'
        };

        vm.loadOrders();

        expect($state.go).toHaveBeenCalledWith('openlmis.orders.podManage', {
            requestingFacilityId: vm.requestingFacility.id,
            supplyingFacilityId: vm.supplyingFacility.id,
            programId: vm.program.id,
            page: 0,
            size: 10
        }, {
            reload: true
        });
    });

    describe('openPod', function() {
        it('should change state when user select order to view its POD', function() {
            spyOn(proofOfDeliveryManageService, 'getByOrderId').andReturn(deferred.promise);
            spyOn($state, 'go').andReturn();

            vm.openPod(pod.id);
            deferred.resolve(pod);
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: pod.id
            });
        });
    });

    describe('printProofOfDelivery', function() {

        beforeEach(function() {
            vm.$onInit();
            spyOn(proofOfDeliveryManageService, 'getByOrderId').andReturn(deferred.promise);
        });

        it('should open loading modal', function() {
            vm.printProofOfDelivery(pod.id);

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should attempt to get proof of delivery', function() {
            vm.printProofOfDelivery(pod.id);
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);
            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should open window after proof of delivery was found', function() {
            vm.printProofOfDelivery(pod.id);

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);

            deferred.resolve(pod);
            $rootScope.$apply();

            expect($window.open).toHaveBeenCalled();
            expect(accessTokenFactory.addAccessToken).toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should close loading modal after pod failed to get', function() {
            vm.printProofOfDelivery(pod.id);

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);
            expect(loadingModalService.close).not.toHaveBeenCalled();

            deferred.reject();
            $rootScope.$apply();

            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should show notification after pod failed to get and loading modal was closed', function() {
            vm.printProofOfDelivery(pod.id);

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);
            expect(loadingModalService.close).not.toHaveBeenCalled();

            deferred.reject();
            $rootScope.$apply();

            expect(notificationService.success).not.toHaveBeenCalled();

            loadingDeferred.resolve();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith('proofOfDeliveryManage.noOrderFound');
        });

    });

});
