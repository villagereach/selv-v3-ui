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
     * @ngdoc controller
     * @name stock-adjustment-creation.controller:StockAdjustmentCreationController
     *
     * @description
     * Controller for managing stock adjustment creation.
     */
    angular
        .module('stock-adjustment-creation')
        .controller('StockAdjustmentCreationController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
        'orderableGroups', 'reasons', 'confirmService', 'messageService', 'user', 'adjustmentType',
        'srcDstAssignments', 'stockAdjustmentCreationService', 'notificationService',
        'orderableGroupService', 'MAX_INTEGER_VALUE', 'VVM_STATUS', 'loadingModalService', 'alertService',
        'dateUtils', 'displayItems', 'ADJUSTMENT_TYPE', 'UNPACK_REASONS', 'REASON_TYPES',
        // SELV3-142: Added lot-management feature
        'hasPermissionToAddNewLot', 'LotResource', '$q', 'editLotModalService', 'moment',
        // SELV3-142: ends here,
        'offlineService'
    ];

    function controller($scope, $state, $stateParams, $filter, confirmDiscardService, program,
                        facility, orderableGroups, reasons, confirmService, messageService, user,
                        adjustmentType, srcDstAssignments, stockAdjustmentCreationService, notificationService,
                        orderableGroupService, MAX_INTEGER_VALUE, VVM_STATUS, loadingModalService,
                        alertService, dateUtils, displayItems, ADJUSTMENT_TYPE, UNPACK_REASONS, REASON_TYPES,
                        // SELV3-142: Added lot-management feature
                        hasPermissionToAddNewLot, LotResource, $q, editLotModalService, moment, offlineService) {
        // SELV3-142: ends here
        var vm = this,
            previousAdded = {};

        // SELV3-142: Added lot-management feature
        vm.$onInit = onInit;
        vm.lotChanged = lotChanged;
        vm.expirationDateChanged = expirationDateChanged;
        vm.newLotCodeChanged = newLotCodeChanged;
        vm.validateExpirationDate = validateExpirationDate;
        // SELV3-142: ends here

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showReasonDropdown
         * @type {boolean}
         */
        vm.showReasonDropdown = true;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name offline
         * @type {boolean}
         *
         * @description
         * Holds information about internet connection
         */
        vm.offline = offlineService.isOffline;

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc property
         * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name newLot
         * @type {Object}
         *
         * @description
         * Holds new lot object.
         */
        vm.newLot = undefined;
        // SELV3-142: ends here

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + 'Creation.' + secondaryKey;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        vm.search = function() {
            vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems, vm.hasLot);

            $stateParams.addedLineItems = vm.addedLineItems;
            $stateParams.displayItems = vm.displayItems;
            $stateParams.keyword = vm.keyword;
            $stateParams.page = getPageNumber();
            $state.go($state.current.name, $stateParams, {
                reload: true,
                notify: false
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name addProduct
         *
         * @description
         * Add a product for stock adjustment.
         */
        vm.addProduct = function() {
            // SELV3-142: Added lot-management feature
            var selectedItem;

            if (vm.selectedOrderableGroup && vm.selectedOrderableGroup.length) {
                vm.newLot.tradeItemId = vm.selectedOrderableGroup[0].orderable.identifiers.tradeItem;
            }

            if (vm.newLot.lotCode) {
                var createdLot = angular.copy(vm.newLot);
                selectedItem = orderableGroupService
                    .findByLotInOrderableGroup(vm.selectedOrderableGroup, createdLot, true);
                selectedItem.$isNewItem = true;
            } else {
                selectedItem = orderableGroupService
                    .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);
            }

            vm.newLot.expirationDateInvalid = undefined;
            vm.newLot.lotCodeInvalid = undefined;
            validateExpirationDate();
            validateLotCode(vm.addedLineItems, selectedItem);
            validateLotCode(vm.allItems, selectedItem);
            var noErrors = !vm.newLot.expirationDateInvalid && !vm.newLot.lotCodeInvalid;

            if (noErrors) {
                vm.addedLineItems.unshift(_.extend({
                    $errors: {},
                    $previewSOH: selectedItem.stockOnHand
                },
                selectedItem, copyDefaultValue()));

                previousAdded = vm.addedLineItems[0];

                vm.search();
            }
        };
        // SELV3-142: ends here

        function copyDefaultValue() {
            var defaultDate;
            if (previousAdded.occurredDate) {
                defaultDate = previousAdded.occurredDate;
            } else {
                defaultDate = dateUtils.toStringDate(new Date());
            }

            return {
                assignment: previousAdded.assignment,
                srcDstFreeText: previousAdded.srcDstFreeText,
                reason: (adjustmentType.state === ADJUSTMENT_TYPE.KIT_UNPACK.state)
                    ? {
                        id: UNPACK_REASONS.KIT_UNPACK_REASON_ID
                    } : previousAdded.reason,
                reasonFreeText: previousAdded.reasonFreeText,
                occurredDate: defaultDate
            };
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name remove
         *
         * @description
         * Remove a line item from added products.
         *
         * @param {Object} lineItem line item to be removed.
         */
        vm.remove = function(lineItem) {
            var index = vm.addedLineItems.indexOf(lineItem);
            vm.addedLineItems.splice(index, 1);

            vm.search();
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name removeDisplayItems
         *
         * @description
         * Remove all displayed line items.
         */
        vm.removeDisplayItems = function() {
            confirmService.confirmDestroy(vm.key('clearAll'), vm.key('clear'))
                .then(function() {
                    vm.addedLineItems = _.difference(vm.addedLineItems, vm.displayItems);
                    vm.displayItems = [];
                });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateQuantity
         *
         * @description
         * Validate line item quantity and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateQuantity = function(lineItem) {
            if (lineItem.quantity > lineItem.$previewSOH && lineItem.reason
                    && lineItem.reason.reasonType === REASON_TYPES.DEBIT) {
                lineItem.$errors.quantityInvalid = messageService
                    .get('stockAdjustmentCreation.quantityGreaterThanStockOnHand');
            } else if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.$errors.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (lineItem.quantity >= 1) {
                lineItem.$errors.quantityInvalid = false;
            } else {
                lineItem.$errors.quantityInvalid = messageService.get(vm.key('positiveInteger'));
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateAssignment
         *
         * @description
         * Validate line item assignment and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateAssignment = function(lineItem) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.ADJUSTMENT.state &&
                adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                lineItem.$errors.assignmentInvalid = isEmpty(lineItem.assignment);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateReason
         *
         * @description
         * Validate line item reason and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateReason = function(lineItem) {
            if (adjustmentType.state === 'adjustment') {
                lineItem.$errors.reasonInvalid = isEmpty(lineItem.reason);
            }
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateDate
         *
         * @description
         * Validate line item occurred date and returns self.
         *
         * @param {Object} lineItem line item to be validated.
         */
        vm.validateDate = function(lineItem) {
            lineItem.$errors.occurredDateInvalid = isEmpty(lineItem.occurredDate);
            return lineItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name clearFreeText
         *
         * @description
         * remove free text from given object.
         *
         * @param {Object} obj      given target to be changed.
         * @param {String} property given property to be cleared.
         */
        vm.clearFreeText = function(obj, property) {
            obj[property] = null;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name submit
         *
         * @description
         * Submit all added items.
         */
        vm.submit = function() {
            $scope.$broadcast('openlmis-form-submit');
            if (validateAllAddedItems()) {
                // SELV3-142: Added lot-management feature
                var lotPromises = [],
                    existingLots = [];
                var lotResource = new LotResource();
                var distinctLots = [];

                vm.addedLineItems.forEach(function(lineItem) {
                    if (lineItem.lot && lineItem.$isNewItem && _.isUndefined(lineItem.lot.id) &&
                    !listContainsTheSameLot(distinctLots, lineItem.lot)) {
                        distinctLots.push(lineItem.lot);
                    }
                });

                distinctLots.forEach(function(lot) {
                    lotPromises.push(lotResource.query({
                        lotCode: lot.lotCode
                    })
                        .then(function(queryResponse) {
                            if (queryResponse.numberOfElements > 0 &&
                                containsLotCode(queryResponse.content, lot.lotCode)) {
                                existingLots.push(lot.lotCode);
                                return queryResponse;
                            }
                        }));
                });
                return $q.all(lotPromises)
                    .then(function() {
                        var confirmMessage = messageService.get(vm.key('confirmInfo'), {
                            username: user.username,
                            number: vm.addedLineItems.length
                        });

                        if (existingLots.length > 0) {
                            var existingLotsConfirmMessage =
                            messageService.get('stockPhysicalInventoryDraft.alreadyExistingProducts', {
                                lots: existingLots
                            });
                            confirmService.confirmDestroy(
                                existingLotsConfirmMessage,
                                'stockPhysicalInventoryDraft.yes'
                            ).then(function() {
                                confirmService.confirm(confirmMessage, vm.key('confirm')).then(confirmSubmit);
                            });
                        } else {
                            confirmService.confirm(confirmMessage, vm.key('confirm')).then(confirmSubmit);
                        }
                    });
            }
            vm.keyword = null;
            reorderItems();
            alertService.error('stockAdjustmentCreation.submitInvalid');
            // SELV3-142: ends here
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name orderableSelectionChanged
         *
         * @description
         * Reset form status and change content inside lots drop down list.
         */
        vm.orderableSelectionChanged = function() {
            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;

            // SELV3-142: Added lot-management feature
            initiateNewLotObject();
            vm.canAddNewLot = false;
            // SELV3-142: ends here

            //same as above
            $scope.productForm.$setUntouched();

            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();

            // SELV3-142: Added lot-management feature
            vm.lots = orderableGroupService.lotsOf(vm.selectedOrderableGroup, vm.hasPermissionToAddNewLot);
            // SELV3-142: ends here
            vm.selectedOrderableHasLots = vm.lots.length > 0;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name getStatusDisplay
         *
         * @description
         * Returns VVM status display.
         *
         * @param  {String} status VVM status
         * @return {String}        VVM status display name
         */
        vm.getStatusDisplay = function(status) {
            return messageService.get(VVM_STATUS.$getDisplayName(status));
        };

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name lotChanged
         *
         * @description
         * Allows inputs to add missing lot to be displayed.
         */
        function lotChanged() {
            vm.canAddNewLot = vm.selectedLot
                && vm.selectedLot.lotCode === messageService.get('orderableGroupService.addMissingLot');
            initiateNewLotObject();
        }
        // SELV3-142: ends here

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
        }

        function validateAllAddedItems() {
            _.each(vm.addedLineItems, function(item) {
                vm.validateQuantity(item);
                vm.validateDate(item);
                vm.validateAssignment(item);
                vm.validateReason(item);
            });
            return _.chain(vm.addedLineItems)
                .groupBy(function(item) {
                    return item.lot ? item.lot.id : item.orderable.id;
                })
                .values()
                .flatten()
                .all(isItemValid)
                .value();
        }

        function isItemValid(item) {
            return _.chain(item.$errors).keys()
                .all(function(key) {
                    return item.$errors[key] === false;
                })
                .value();
        }

        function reorderItems() {
            var sorted = $filter('orderBy')(vm.addedLineItems, ['orderable.productCode', '-occurredDate']);

            vm.displayItems = _.chain(sorted).groupBy(function(item) {
                return item.lot ? item.lot.id : item.orderable.id;
            })
                .sortBy(function(group) {
                    return _.every(group, function(item) {
                        return !item.$errors.quantityInvalid;
                    });
                })
                .flatten(true)
                .value();
        }

        // SELV3-142: Added lot-management feature
        function containsLotCode(lotsArray, lotCode) {
            var containsCode = false;
            lotsArray.forEach(function(lot) {
                if (lot.lotCode === lotCode) {
                    containsCode = true;
                }
            });
            return containsCode;
        }
        // SELV3-142: ends here

        function confirmSubmit() {
            loadingModalService.open();

            var addedLineItems = angular.copy(vm.addedLineItems);

            generateKitConstituentLineItem(addedLineItems);

            // SELV3-142: Added lot-management feature
            var lotPromises = [],
                errorLots = [];
            var distinctLots = [];
            var lotResource = new LotResource();
            addedLineItems.forEach(function(lineItem) {
                if (lineItem.lot && lineItem.$isNewItem && _.isUndefined(lineItem.lot.id) &&
                !listContainsTheSameLot(distinctLots, lineItem.lot)) {
                    distinctLots.push(lineItem.lot);
                }
            });

            distinctLots.forEach(function(lot) {
                lotPromises.push(lotResource.create(lot)
                    .then(function(createResponse) {
                        vm.addedLineItems.forEach(function(item) {
                            if (item.lot.lotCode === lot.lotCode) {
                                item.$isNewItem = false;
                                addItemToOrderableGroups(item);
                            }
                        });
                        return createResponse;
                    })
                    .catch(function(response) {
                        if (response.data.messageKey ===
                            'referenceData.error.lot.lotCode.mustBeUnique') {
                            errorLots.push(lot.lotCode);
                        }
                    }));
            });

            return $q.all(lotPromises)
                .then(function(responses) {
                    if (errorLots !== undefined && errorLots.length > 0) {
                        return $q.reject();
                    }
                    responses.forEach(function(lot) {
                        addedLineItems.forEach(function(lineItem) {
                            if (lineItem.lot && lineItem.lot.lotCode === lot.lotCode
                                && lineItem.lot.tradeItemId === lot.tradeItemId) {
                                lineItem.lot = lot;
                            }
                        });
                        return addedLineItems;
                    });
                    stockAdjustmentCreationService.submitAdjustments(
                        program.id, facility.id, addedLineItems, adjustmentType
                    )
                        .then(function() {
                            if (offlineService.isOffline()) {
                                notificationService.offline(vm.key('submittedOffline'));
                            } else {
                                notificationService.success(vm.key('submitted'));
                            }
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                facility: facility.id,
                                program: program.id
                            });
                        }, function(errorResponse) {
                            loadingModalService.close();
                            alertService.error(errorResponse.data.message);
                        });
                })
                .catch(function(errorResponse) {
                    loadingModalService.close();
                    if (errorLots) {
                        alertService.error('stockPhysicalInventoryDraft.lotCodeMustBeUnique',
                            errorLots.join(', '));
                        vm.selectedOrderableGroup = undefined;
                        vm.selectedLot = undefined;
                        vm.lotChanged();
                        return $q.reject(errorResponse.data.message);
                    }
                    alertService.error(errorResponse.data.message);
                });
        }

        function addItemToOrderableGroups(item) {
            vm.orderableGroups.forEach(function(array) {
                if (array[0].orderable.id === item.orderable.id) {
                    array.push(angular.copy(item));
                }
            });
        }

        function listContainsTheSameLot(list, lot) {
            var itemExistsOnList = false;
            list.forEach(function(item) {
                if (item.lotCode === lot.lotCode &&
                    item.tradeItemId === lot.tradeItemId) {
                    itemExistsOnList = true;
                }
            });
            return itemExistsOnList;
        }
        // SELV3-142: ends here

        function generateKitConstituentLineItem(addedLineItems) {
            if (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state) {
                return;
            }

            //CREDIT reason ID
            var creditReason = {
                id: UNPACK_REASONS.UNPACKED_FROM_KIT_REASON_ID
            };

            var constituentLineItems = [];

            addedLineItems.forEach(function(lineItem) {
                lineItem.orderable.children.forEach(function(constituent) {
                    constituent.reason = creditReason;
                    constituent.occurredDate = lineItem.occurredDate;
                    constituent.quantity = lineItem.quantity * constituent.quantity;
                    constituentLineItems.push(constituent);
                });
            });

            addedLineItems.push.apply(addedLineItems, constituentLineItems);
        }

        function onInit() {
            // SELV3-142: Added lot-management feature
            var copiedOrderableGroups = angular.copy(orderableGroups);
            vm.allItems = _.flatten(copiedOrderableGroups);
            // SELV3-142: ends here

            $state.current.label = messageService.get(vm.key('title'), {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            initViewModel();
            initStateParams();

            $scope.$watch(function() {
                return vm.addedLineItems;
            }, function(newValue) {
                $scope.needToConfirm = newValue.length > 0;
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            $scope.$on('$stateChangeStart', function() {
                angular.element('.popover').popover('destroy');
            });
        }

        function initViewModel() {
            //Set the max-date of date picker to the end of the current day.
            vm.maxDate = new Date();
            vm.maxDate.setHours(23, 59, 59, 999);

            vm.program = program;
            vm.facility = facility;
            vm.reasons = reasons;
            vm.showReasonDropdown = (adjustmentType.state !== ADJUSTMENT_TYPE.KIT_UNPACK.state);
            // SELV3-439 Fix “out of memory“ error on stock management issue page
            vm.srcDstAssignments = srcDstAssignments.content;
            // SELV3-439 ends here
            vm.addedLineItems = $stateParams.addedLineItems || [];
            $stateParams.displayItems = displayItems;
            vm.displayItems = $stateParams.displayItems || [];
            vm.keyword = $stateParams.keyword;

            vm.orderableGroups = orderableGroups;
            vm.hasLot = false;
            vm.orderableGroups.forEach(function(group) {
                // SELV3-142: Added lot-management feature
                vm.hasLot = vm.hasLot || orderableGroupService.lotsOf(group, hasPermissionToAddNewLot).length > 0;
                // SELV3-142: ends here
            });
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(vm.orderableGroups);
            // SELV3-142: Added lot-management feature
            vm.hasPermissionToAddNewLot = hasPermissionToAddNewLot;
            vm.canAddNewLot = false;
            initiateNewLotObject();
            // SELV3-142: ends here
        }

        function initiateNewLotObject() {
            vm.newLot = {
                active: true
            };
        }

        function initStateParams() {
            $stateParams.page = getPageNumber();
            $stateParams.program = program;
            $stateParams.facility = facility;
            $stateParams.reasons = reasons;
            $stateParams.srcDstAssignments = srcDstAssignments;
            $stateParams.orderableGroups = orderableGroups;
        }

        function getPageNumber() {
            var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
            var pageNumber = parseInt($state.params.page || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name editLot
         *
         * @description
         * Pops up a modal for users to edit lot for selected line item.
         *
         * @param {Object} lineItem line items to be edited.
         */
        vm.editLot = function(lineItem) {
            var oldLotCode = lineItem.lot.lotCode;
            var oldLotExpirationDate = lineItem.lot.expirationDate;
            editLotModalService.show(lineItem, vm.allItems, vm.addedLineItems).then(function() {
                $stateParams.displayItems = vm.displayItems;
                if (oldLotCode === lineItem.lot.lotCode
                    && oldLotExpirationDate !== lineItem.lot.expirationDate) {
                    vm.addedLineItems.forEach(function(item) {
                        if (item.lot && item.lot.lotCode === oldLotCode &&
                            oldLotExpirationDate === item.lot.expirationDate) {
                            item.lot.expirationDate = lineItem.lot.expirationDate;
                        }
                    });
                }
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name canEditLot
         *
         * @description
         * Checks if user can edit lot.
         *
         * @param {Object} lineItem line item to edit
         */
        vm.canEditLot = function(lineItem) {
            return vm.hasPermissionToAddNewLot && lineItem.lot && lineItem.$isNewItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateExpirationDate
         *
         * @description
         * Validate if expirationDate is a future date.
         */
        function validateExpirationDate() {
            var currentDate = moment(new Date()).format('YYYY-MM-DD');

            if (vm.newLot.expirationDate && vm.newLot.expirationDate < currentDate) {
                vm.newLot.expirationDateInvalid = messageService.get('stockEditLotModal.expirationDateInvalid');
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name expirationDateChanged
         *
         * @description
         * Hides the error message if exists after changed expiration date.
         */
        function expirationDateChanged() {
            vm.newLot.expirationDateInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name newLotCodeChanged
         *
         * @description
         * Hides the error message if exists after changed new lot code.
         */
        function newLotCodeChanged() {
            vm.newLot.lotCodeInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name validateLotCode
         *
         * @description
         * Validate if on line item list exists the same orderable with the same lot code
         */
        function validateLotCode(listItems, selectedItem) {
            if (selectedItem && selectedItem.$isNewItem) {
                listItems.forEach(function(lineItem) {
                    if (lineItem.orderable && lineItem.lot && selectedItem.lot &&
                        lineItem.orderable.productCode === selectedItem.orderable.productCode &&
                        selectedItem.lot.lotCode === lineItem.lot.lotCode &&
                        ((!lineItem.$isNewItem) || (lineItem.$isNewItem &&
                        selectedItem.lot.expirationDate !== lineItem.lot.expirationDate))) {
                        vm.newLot.lotCodeInvalid = messageService.get('stockEditLotModal.lotCodeInvalid');
                    }
                });
            }
        }
        // SELV3-142: ends here
    }
})();