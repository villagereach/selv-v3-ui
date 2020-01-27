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

describe('OrderableAddEditGeneralController', function() {

    beforeEach(function() {
        module('admin-orderable-edit', function($provide) {
            $provide.service('notificationService', function() {
                return jasmine.createSpyObj('notificationService', ['success', 'error']);
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.confirmService = $injector.get('confirmService');
            this.$state = $injector.get('$state');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.OrderableResource = $injector.get('OrderableResource');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.FunctionDecorator = $injector.get('FunctionDecorator');
        });

        this.orderable = new this.OrderableDataBuilder().buildJson();
        this.successNotificationKey = 'successMessage.key';
        this.errorNotificationKey = 'errorMessage.key';
        this.orderableListRelativePath = 'orderable.list.relative.path';

        // SELV3-13: Added net volume and storage temperature properties to Orderables
        this.orderable.minimumTemperature = {
            value: 2,
            temperatureMeasurementUnitCode: 'CEL'
        };
        this.orderable.maximumTemperature = {
            value: 8,
            temperatureMeasurementUnitCode: 'CEL'
        };
        this.orderable.inBoxCubeDimension = {
            value: 200,
            measurementUnitCode: 'MLT'
        };
        // SELV3-13: ends here
        spyOn(this.$state, 'go');
        spyOn(this.OrderableResource.prototype, 'update').andReturn(this.$q.resolve(this.orderable));
        spyOn(this.FunctionDecorator.prototype, 'withSuccessNotification').andCallThrough();
        spyOn(this.FunctionDecorator.prototype, 'withErrorNotification').andCallThrough();

        this.vm = this.$controller('OrderableAddEditGeneralController', {
            orderable: this.orderable,
            successNotificationKey: this.successNotificationKey,
            errorNotificationKey: this.errorNotificationKey,
            orderableListRelativePath: this.orderableListRelativePath
        });
        this.vm.$onInit();
    });

    describe('onInit', function() {

        it('should expose orderable', function() {
            expect(this.vm.orderable).toEqual(this.orderable);
        });

        it('should decorate with correct success message', function() {
            expect(this.FunctionDecorator.prototype.withSuccessNotification)
                .toHaveBeenCalledWith(this.successNotificationKey);
        });

        it('should decorate with correct error message', function() {
            expect(this.FunctionDecorator.prototype.withErrorNotification)
                .toHaveBeenCalledWith(this.errorNotificationKey);
        });

    });

    describe('goToOrderableList', function() {

        it('should call state go with correct params', function() {
            this.vm.goToOrderableList();

            expect(this.$state.go).toHaveBeenCalledWith(this.orderableListRelativePath, {}, {
                reload: true
            });
        });
    });

    describe('saveOrderable', function() {

        it('should save orderable', function() {
            this.vm.saveOrderable();

            expect(this.OrderableResource.prototype.update).toHaveBeenCalledWith(this.orderable);
        });

        it('should redirect to the list view on success', function() {
            this.vm.saveOrderable();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith(this.orderableListRelativePath, {}, {
                reload: true
            });
        });

        it('should not redirect to the list view on failure', function() {
            this.OrderableResource.prototype.update.andReturn(this.$q.reject());

            this.vm.saveOrderable();
            this.$rootScope.$apply();

            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should redirect to the edit screen if creating a new orderable', function() {
            var createdOrderable = new this.OrderableDataBuilder().build();

            this.OrderableResource.prototype.update.andReturn(this.$q.resolve(createdOrderable));
            this.orderable.id = undefined;
            this.vm.$onInit();

            this.vm.saveOrderable();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('^.edit.general', {
                id: createdOrderable.id
            });
        });

        // SELV3-13: Added net volume and storage temperature properties to Orderables
        it('should not save if max storage temp is lower than min storage temp', function() {
            this.orderable.minimumTemperature.value = 12;
            this.vm.maximumTemperatureChanged();

            this.vm.saveOrderable();

            expect(this.OrderableResource.prototype.update).not.toHaveBeenCalled();
        });

        it('should save if max storage temp is greater than min storage temp', function() {
            this.vm.saveOrderable();

            expect(this.OrderableResource.prototype.update).toHaveBeenCalled();
        });

        it('should not save if net volume is 0', function() {
            this.orderable.inBoxCubeDimension.value = 0;
            this.vm.inBoxCubeDimensionChanged();

            this.vm.saveOrderable();

            expect(this.OrderableResource.prototype.update).not.toHaveBeenCalled();
        });
        // SELV3-13: ends here
    });
});