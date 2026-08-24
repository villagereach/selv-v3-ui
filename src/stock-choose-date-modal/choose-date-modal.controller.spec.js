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

describe('ChooseDateModalController', function() {

    // SELV3-507: Allow user to enter Shipment Date
    var vm, $q, $controller, authorizationService, UserDataBuilder, user, $filter, modalDeferred, minDate,
        showPhysicalInventoryWarning;

    beforeEach(function() {
        module('stock-choose-date-modal');
        module('referencedata-user');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $filter = $injector.get('$filter');
            $q = $injector.get('$q');
            authorizationService = $injector.get('authorizationService');
            UserDataBuilder = $injector.get('UserDataBuilder');
        });

        user = new UserDataBuilder().build();
        modalDeferred = $q.defer();
        minDate = $filter('isoDate')(new Date(1900, 1, 1));
        showPhysicalInventoryWarning = true;

        spyOn(authorizationService, 'getUser').andReturn(user);

        vm = $controller('ChooseDateModalController', {
            modalDeferred: modalDeferred,
            minDate: minDate,
            showPhysicalInventoryWarning: showPhysicalInventoryWarning
        });

    });

    describe('$onInit', function() {

        it('should expose signature', function() {
            expect(vm.signature).toEqual('');
        });

        it('should expose username', function() {
            expect(vm.username).toEqual(user.username);
        });
    });

    describe('submit', function() {

        beforeEach(function() {
            spyOn(modalDeferred, 'resolve');
        });

        it('should not resolve modal if occurred date is undefined', function() {
            vm.occurredDate = undefined;

            vm.submit();

            expect(modalDeferred.resolve).not.toHaveBeenCalled();
        });

        it('should resolve modal if occurred date is selected', function() {
            vm.submit();

            expect(modalDeferred.resolve).toHaveBeenCalledWith({
                occurredDate: vm.occurredDate,
                signature: vm.signature,
                shipmentDate: vm.shipmentDate,
                // SELV3-846: additional shipment fields
                volumesCount: vm.volumesCount,
                icePacksCount: vm.icePacksCount,
                packingPerson: vm.packingPerson,
                truckRegistration: vm.truckRegistration,
                trailerRegistration: vm.trailerRegistration,
                securitySeal: vm.securitySeal
            });
        });
    });
    // SELV3-507: ends here

    // SELV3-846: Additional shipment fields
    describe('additional shipment fields', function() {

        it('should initialize the additional shipment fields as empty', function() {
            expect(vm.volumesCount).toEqual('');
            expect(vm.icePacksCount).toEqual('');
            expect(vm.packingPerson).toEqual('');
            expect(vm.truckRegistration).toEqual('');
            expect(vm.trailerRegistration).toEqual('');
            expect(vm.securitySeal).toEqual('');
        });

        it('should expose the field length limits', function() {
            expect(vm.maxCountLength).toEqual(9);
            expect(vm.maxTextLength).toEqual(255);
        });

        it('should uppercase the truck registration', function() {
            vm.truckRegistration = 'abc123xx';

            vm.formatTruckRegistration();

            expect(vm.truckRegistration).toEqual('ABC123XX');
        });

        it('should flag a truck registration that does not match the plate format', function() {
            vm.truckRegistration = 'ABC12MP';

            expect(vm.isTruckRegistrationInvalid()).toBe(true);
        });

        it('should not flag a valid or empty truck registration', function() {
            vm.truckRegistration = 'ABC123MP';

            expect(vm.isTruckRegistrationInvalid()).toBe(false);

            vm.truckRegistration = '';

            expect(vm.isTruckRegistrationInvalid()).toBe(false);
        });

        it('should not flag the no-vehicle placeholder truck registration', function() {
            vm.truckRegistration = 'XXXXXXXX';

            expect(vm.isTruckRegistrationInvalid()).toBe(false);
        });

        it('should resolve modal with the entered additional shipment fields', function() {
            spyOn(modalDeferred, 'resolve');
            vm.volumesCount = 6;
            vm.packingPerson = 'J. Silva';

            vm.submit();

            expect(modalDeferred.resolve).toHaveBeenCalledWith({
                occurredDate: vm.occurredDate,
                signature: vm.signature,
                shipmentDate: vm.shipmentDate,
                volumesCount: 6,
                icePacksCount: '',
                packingPerson: 'J. Silva',
                truckRegistration: '',
                trailerRegistration: '',
                securitySeal: ''
            });
        });
    });
    // SELV3-846: ends here
});
