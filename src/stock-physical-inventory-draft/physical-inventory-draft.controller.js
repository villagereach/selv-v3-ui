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
     * @name stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     *
     * @description
     * Controller for managing physical inventory draft.
     */
    angular
        .module('stock-physical-inventory-draft')
        .controller('PhysicalInventoryDraftController', controller);

    controller.$inject = ['$scope', '$state', '$stateParams', 'addProductsModalService',
        'messageService', 'physicalInventoryFactory', 'notificationService', 'alertService',
        'confirmDiscardService', 'chooseDateModalService', 'program', 'facility', 'draft',
        'displayLineItemsGroup', 'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
        'VVM_STATUS', 'reasons', 'stockReasonsCalculations', 'loadingModalService', '$window',
        'stockmanagementUrlFactory', 'accessTokenFactory', 'orderableGroupService', '$filter',
        // SELV3-142: Added lot-management feature
        'LotResource', '$q', 'editLotModalService'];
    // SELV3-142: ends here

    function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                        physicalInventoryFactory, notificationService, alertService, confirmDiscardService,
                        chooseDateModalService, program, facility, draft, displayLineItemsGroup,
                        confirmService, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
                        reasons, stockReasonsCalculations, loadingModalService, $window,
                        stockmanagementUrlFactory, accessTokenFactory, orderableGroupService, $filter,
                        // SELV3-142: Added lot-management feature
                        LotResource, $q, editLotModalService) {
        // SELV3-142: ends here      
        var vm = this;

        vm.$onInit = onInit;

        vm.quantityChanged = quantityChanged;
        vm.checkUnaccountedStockAdjustments = checkUnaccountedStockAdjustments;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name displayLineItemsGroup
         * @type {Array}
         *
         * @description
         * Holds current display physical inventory draft line items grouped by orderable id.
         */
        vm.displayLineItemsGroup = displayLineItemsGroup;

        vm.updateProgress = function() {
            vm.itemsWithQuantity = _.filter(vm.displayLineItemsGroup, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return !isEmpty(lineItem.quantity);
                });
            });
        };

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds current program info.
         */
        vm.program = program;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds home facility info.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name keyword
         * @type {String}
         *
         * @description
         * Holds keywords for searching.
         */
        vm.keyword = $stateParams.keyword;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name vvmStatuses
         * @type {Object}
         *
         * @description
         * Holds list of VVM statuses.
         */
        vm.vvmStatuses = VVM_STATUS;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name groupedCategories
         * @type {Object}
         *
         * @description
         * Holds line items grouped by category.
         */
        vm.groupedCategories = false;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name showVVMStatusColumn
         * @type {boolean}
         *
         * @description
         * Indicates if VVM Status column should be visible.
         */
        vm.showVVMStatusColumn = false;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
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

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name addProducts
         *
         * @description
         * Pops up a modal for users to add products for physical inventory.
         */
        vm.addProducts = function() {
            var notYetAddedItems = _.chain(draft.lineItems)
                .difference(_.flatten(vm.displayLineItemsGroup))
                .value();

            // SELV3-142: Added lot-management feature
            var orderablesWithoutAvailableLots = draft.lineItems.map(function(item) {
                return item.orderable;
            }).filter(function(orderable) {
                return !notYetAddedItems.find(function(item) {
                    return orderable.id === item.orderable.id;
                });
            })
                .filter(function(orderable, index, filtered) {
                    return filtered.indexOf(orderable) === index;
                })
                .map(function(uniqueOrderable) {
                    return {
                        lot: null,
                        orderable: uniqueOrderable,
                        quantity: null,
                        stockAdjustments: [],
                        stockOnHand: null,
                        vvmStatus: null,
                        $allLotsAdded: true
                    };
                });

            orderablesWithoutAvailableLots.forEach(function(item) {
                notYetAddedItems.push(item);
            });

            addProductsModalService.show(notYetAddedItems, draft.lineItems).then(function() {
                // SELV3-142: ends here
                $stateParams.program = vm.program;
                $stateParams.facility = vm.facility;
                $stateParams.draft = draft;

                $stateParams.isAddProduct = true;

                //Only reload current state and avoid reloading parent state
                $state.go($state.current.name, $stateParams, {
                    reload: $state.current.name
                });
            });
        };

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name editLot
         *
         * @description
         * Pops up a modal for users to edit lot for selected line item.
         *
         * @param {Object} lineItem line items to be edited.
         */
        vm.editLot = function(lineItem) {
            var addedLineItems = _.flatten(draft.lineItems);
            editLotModalService.show(lineItem, addedLineItems).then(function() {
                $stateParams.draft = draft;
            });
        };
        // SELV3-142: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name calculate
         *
         * @description
         * Aggregate values of provided field for a group of line items.
         *
         * @param {Object} lineItems line items to be calculate.
         * @param {String} field     property name of line items to be aggregate.
         */
        vm.calculate = function(lineItems, field) {
            var allEmpty = _.every(lineItems, function(lineItem) {
                return isEmpty(lineItem[field]);
            });
            if (allEmpty) {
                return undefined;
            }

            return _.chain(lineItems).map(function(lineItem) {
                return lineItem[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name search
         *
         * @description
         * It searches from the total line items with given keyword. If keyword is empty then all line
         * items will be shown.
         */
        vm.search = function() {
            $stateParams.page = 0;
            $stateParams.keyword = vm.keyword;
            $stateParams.program = vm.program;
            $stateParams.facility = vm.facility;
            $stateParams.draft = draft;

            //Only reload current state and avoid reloading parent state
            $state.go($state.current.name, $stateParams, {
                reload: $state.current.name
            });
        };

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraftOrSubmit
         *
         * @description
         * Inform about already existing lots and redirect to save physical inventory draft or submit it,
         * depending on the parameter.
         * 
         * @param {boolean} submitDraft if true, redirect to submit method
         */
        vm.saveDraftOrSubmit = function(submitDraft) {
            var lotPromises = [];
            var existingLots = [];

            draft.lineItems.forEach(function(lineItem) {
                if (lineItem.lot && lineItem.$isNewItem && !lineItem.lot.id) {
                    lotPromises.push(new LotResource().query({
                        lotCode: lineItem.lot.lotCode
                    })
                        .then(function(queryResponse) {
                            if (queryResponse.numberOfElements > 0 &&
                                containsLotCode(queryResponse.content, lineItem.lot.lotCode)) {
                                existingLots.push(lineItem.lot.lotCode);
                                return queryResponse;
                            }
                            return queryResponse;
                        }));
                }
            });

            return $q.all(lotPromises)
                .then(function() {
                    if (existingLots.length > 0) {
                        var confirmMessage = messageService.get('stockPhysicalInventoryDraft.alreadyExistingProducts', {
                            lots: existingLots
                        });
                        confirmService.confirmDestroy(
                            confirmMessage,
                            'stockPhysicalInventoryDraft.yes'
                        ).then(function() {
                            if (submitDraft) {
                                return vm.submit();
                            }
                            return saveDraft();
                        });
                    } else {
                        if (submitDraft) {
                            return vm.submit();
                        }
                        saveDraft();
                    }
                });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraft
         *
         * @description
         * Save physical inventory draft.
         */
        function saveDraft() {
            confirmService.confirmDestroy(
                'stockPhysicalInventoryDraft.saveDraft',
                'stockPhysicalInventoryDraft.save'
            ).then(function() {
                loadingModalService.open();

                return saveLots(draft, function() {
                    return physicalInventoryFactory.saveDraft(draft).then(function() {
                        notificationService.success('stockPhysicalInventoryDraft.saved');
                        resetWatchItems();

                        $stateParams.isAddProduct = false;

                        $stateParams.program = vm.program;
                        $stateParams.facility = vm.facility;
                        draft.lineItems.forEach(function(lineItem) {
                            if (lineItem.$isNewItem) {
                                lineItem.$isNewItem = false;
                            }
                        });
                        $stateParams.draft = draft;
                        //Reload parent state and current state to keep data consistency.
                        $state.go($state.current.name, $stateParams, {
                            reload: true
                        });
                    }, function() {
                        loadingModalService.close();
                        alertService.error('stockPhysicalInventoryDraft.saveFailed');
                    });
                });
            });
        }
        // SELV3-142: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name delete
         *
         * @description
         * Delete physical inventory draft.
         */
        vm.delete = function() {
            confirmService.confirmDestroy(
                'stockPhysicalInventoryDraft.deleteDraft',
                'stockPhysicalInventoryDraft.delete'
            ).then(function() {
                loadingModalService.open();
                physicalInventoryService.deleteDraft(draft.id).then(function() {
                    $scope.needToConfirm = false;
                    $state.go('openlmis.stockmanagement.physicalInventory', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name submit
         *
         * @description
         * Submit physical inventory.
         */
        vm.submit = function() {
            if (validate()) {
                $scope.$broadcast('openlmis-form-submit');
                alertService.error('stockPhysicalInventoryDraft.submitInvalid');
            } else {
                return confirmService.confirmDestroy(
                    'stockPhysicalInventoryDraft.saveDraft',
                    'stockPhysicalInventoryDraft.save'
                ).then(function() {
                    chooseDateModalService.show().then(function(resolvedData) {
                        loadingModalService.open();

                        draft.occurredDate = resolvedData.occurredDate;
                        draft.signature = resolvedData.signature;

                        // SELV3-142: Added lot-management feature
                        return saveLots(draft, function() {
                            physicalInventoryService.submitPhysicalInventory(draft).then(function() {
                                notificationService.success('stockPhysicalInventoryDraft.submitted');
                                confirmService.confirm('stockPhysicalInventoryDraft.printModal.label',
                                    'stockPhysicalInventoryDraft.printModal.yes',
                                    'stockPhysicalInventoryDraft.printModal.no')
                                    .then(function() {
                                        $window.open(accessTokenFactory
                                            .addAccessToken(getPrintUrl(draft.id)), '_blank');
                                    })
                                    .finally(function() {
                                        $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                            program: program.id,
                                            facility: facility.id
                                        });
                                    });
                            }, function() {
                                loadingModalService.close();
                                alertService.error('stockPhysicalInventoryDraft.submitFailed');
                            });
                        });
                    });
                    // SELV3-142: ends here
                });
            }
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
            if (lineItem.quantity > MAX_INTEGER_VALUE) {
                lineItem.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(lineItem.quantity)) {
                lineItem.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                lineItem.quantityInvalid = false;
            }
            return lineItem.quantityInvalid;
        };

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

        function saveLots(draft, submitMethod) {
            var lotPromises = [],
                lotResource = new LotResource(),
                errorLots = [];

            draft.lineItems.forEach(function(lineItem) {
                if (lineItem.lot && lineItem.$isNewItem && !lineItem.lot.id) {
                    lotPromises.push(lotResource.create(lineItem.lot)
                        .then(function(createResponse) {
                            lineItem.$isNewItem = false;
                            return createResponse;
                        })
                        .catch(function(response) {
                            if (response.data.messageKey ===
                                'referenceData.error.lot.lotCode.mustBeUnique') {
                                errorLots.push(lineItem.lot.lotCode);
                            }
                        }));
                }
            });

            return $q.all(lotPromises)
                .then(function(responses) {
                    if (errorLots !== undefined && errorLots.length > 0) {
                        return $q.reject();
                    }
                    responses.forEach(function(lot) {
                        draft.lineItems.forEach(function(lineItem) {
                            if (lineItem.lot && lineItem.lot.lotCode === lot.lotCode
                                && lineItem.lot.tradeItemId === lot.tradeItemId) {
                                lineItem.lot = lot;
                            }
                        });
                        return draft.lineItems;
                    });
                    return submitMethod();
                })
                .catch(function(errorResponse) {
                    loadingModalService.close();
                    if (errorLots) {
                        alertService.error('stockPhysicalInventoryDraft.lotCodeMustBeUnique',
                            errorLots.join(', '));
                        return $q.reject(errorResponse.data.message);
                    }
                    alertService.error(errorResponse.data.message);
                });
        }
        // SELV3-142: ends here
        function isEmpty(value) {
            return value === '' || value === undefined || value === null;
        }

        function validate() {
            var anyError = false;

            _.chain(displayLineItemsGroup).flatten()
                .each(function(item) {
                    anyError = vm.validateQuantity(item) || anyError;
                });
            return anyError;
        }

        var watchItems = [];

        function resetWatchItems() {
            $scope.needToConfirm = false;
            watchItems = angular.copy(vm.displayLineItemsGroup);
        }

        function onInit() {
            $state.current.label = messageService.get('stockPhysicalInventoryDraft.title', {
                facilityCode: facility.code,
                facilityName: facility.name,
                program: program.name
            });

            vm.reasons = reasons;
            vm.stateParams = $stateParams;
            $stateParams.program = undefined;
            $stateParams.facility = undefined;
            $stateParams.draft = undefined;

            vm.updateProgress();
            resetWatchItems();
            $scope.$watch(function() {
                return vm.displayLineItemsGroup;
            }, function(newValue) {
                $scope.needToConfirm = ($stateParams.isAddProduct || !angular.equals(newValue, watchItems));
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

            var orderableGroups = orderableGroupService.groupByOrderableId(draft.lineItems);
            vm.showVVMStatusColumn = orderableGroupService.areOrderablesUseVvm(orderableGroups);

            $scope.$watchCollection(function() {
                return vm.pagedLineItems;
            }, function(newList) {
                vm.groupedCategories = $filter('groupByProgramProductCategory')(newList, vm.program.id);
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name checkUnaccountedStockAdjustments
         *
         * @description
         * Calculates unaccounted and set value to line item.
         *
         * @param   {Object}    lineItem    the lineItem containing stock adjustments
         */
        function checkUnaccountedStockAdjustments(lineItem) {
            lineItem.unaccountedQuantity =
              stockReasonsCalculations.calculateUnaccounted(lineItem, lineItem.stockAdjustments);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name quantityChanged
         *
         * @description
         * Callback method for quantity change. It will update progress and fire up validations.
         *
         * @param   {Object}    lineItem    the lineItem containing quantity
         */
        function quantityChanged(lineItem) {
            vm.updateProgress();
            vm.validateQuantity(lineItem);
            vm.checkUnaccountedStockAdjustments(lineItem);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name getPrintUrl
         *
         * @description
         * Prepares a print URL for the given physical inventory.
         *
         * @return {String} the prepared URL
         */
        function getPrintUrl(id) {
            return stockmanagementUrlFactory('/api/reports/templates/common/' +
                '968b4abc-ea64-4285-9f46-64544d8af37e/pdf?physInventoryId=' + id);
        }

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name removeLineItem
         *
         * @description
         * Removes selected line item
         *
         * @param {Object} lineItem line item to remove
         */
        vm.removeLineItem = function(lineItem) {
            confirmService.confirmDestroy(
                'stockPhysicalInventoryDraft.deleteItem',
                'stockPhysicalInventoryDraft.yes'
            ).then(function() {
                loadingModalService.open();
                vm.displayLineItemsGroup.forEach(function(array) {
                    var indexOfItem = array.indexOf(lineItem);
                    if (indexOfItem > -1) {
                        array[indexOfItem].isAdded = false;
                        array[indexOfItem].quantity = null;
                        array[indexOfItem].stockOnHand = null;
                        if (array.length === 1 && angular.equals(array[0], lineItem)) {
                            indexOfItem = vm.displayLineItemsGroup.indexOf(array);
                            vm.displayLineItemsGroup.splice(indexOfItem, 1);
                        } else {
                            array.splice(indexOfItem, 1);
                        }
                    }
                });
                if (lineItem.$isNewItem) {
                    var indexOfLineItem = draft.lineItems.indexOf(lineItem);
                    draft.lineItems.splice(indexOfLineItem, 1);
                }
                vm.search();
            });
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name canEditLot
         *
         * @description
         * Checks if user can edit lot if it was created during inventory
         *
         * @param {Object} lineItem line item to edit
         */
        vm.canEditLot = function(lineItem) {
            return lineItem.lot && lineItem.$isNewItem;
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
         * @name saveDraftOnPageChange
         *
         * @description
         * Saves physical inventory draft on page change.
         */
        vm.saveDraftOnPageChange = function() {
            var params = {};
            params.draft = draft;
            return $q.resolve(params);
        };
        // SELV3-142: ends here
    }
})();