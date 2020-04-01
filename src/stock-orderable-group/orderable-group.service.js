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
     * @name stock-orderable-group.orderableGroupService
     *
     * @description
     * Responsible for managing orderable groups.
     */
    angular
        .module('stock-orderable-group')
        .service('orderableGroupService', service);

    service.$inject = ['messageService', 'StockCardSummaryRepositoryImpl',
        'FullStockCardSummaryRepositoryImpl', 'StockCardSummaryRepository'];

    function service(messageService, StockCardSummaryRepositoryImpl,
                     FullStockCardSummaryRepositoryImpl, StockCardSummaryRepository) {

        var noLotDefined = {
            lotCode: messageService.get('orderableGroupService.noLotDefined')
        };

        this.findAvailableProductsAndCreateOrderableGroups = findAvailableProductsAndCreateOrderableGroups;
        this.lotsOf = lotsOf;
        this.determineLotMessage = determineLotMessage;
        this.groupByOrderableId = groupByOrderableId;
        this.findByLotInOrderableGroup = findByLotInOrderableGroup;
        this.areOrderablesUseVvm = areOrderablesUseVvm;
        this.getKitOnlyOrderablegroup = getKitOnlyOrderablegroup;
        // SELV3-142: Added lot-management feature
        this.addItemWithNewLot = addItemWithNewLot;

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name lotsOf
         *
         * @description
         * Extract lots from orderable group. Adds no lot defined as an option when some group
         * has no lot
         *
         * @param  {Object}  orderableGroup       orderable group
         * @param  {boolean} addMissingLotAllowed true if adding new lots is available
         * @return {Array}                        array with lots
         */
        function lotsOf(orderableGroup, addMissingLotAllowed) {
            var addMissingLot = {
                    lotCode: messageService.get('orderableGroupService.addMissingLot')
                },
                lots;

            if (orderableGroup && orderableGroup.length > 0 && orderableGroup[0].$allLotsAdded) {
                lots = [];
            } else {
                lots = _.chain(orderableGroup).pluck('lot')
                    .compact()
                    .value();
                var someHasLot = lots.length > 0,
                    someHasNoLot = _.any(orderableGroup, function(item) {
                        return !item.lot;
                    });

                if ((addMissingLotAllowed || someHasLot) && someHasNoLot) {
                    lots.unshift(noLotDefined);
                }
                sortByFieldName(lots, 'expirationDate');
            }

            if (addMissingLotAllowed) {
                lots.unshift(addMissingLot);
            }
            return lots;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name sortByFieldName
         *
         * @description
         * Sorts array by field name
         *
         * @param {Object} array         array to sort
         * @param {Object} fieldName     name of the field by which the array is sorted
         */
        function sortByFieldName(array, fieldName) {
            array.sort(function(a, b) {
                if (a[fieldName] < b[fieldName]) {
                    return -1;
                } else if (a[fieldName] > b[fieldName]) {
                    return 1;
                }
                return 0;
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name determineLotMessage
         *
         * @description
         * Determines lot message based on a lot and an orderable group.
         *
         * @param {Object} orderableGroup         orderable group
         * @param {Object} selectedItem           product with lot property. Property displayLotMessage
         *                                        will be assigned to id.
         * @param {boolean} addMissingLotAllowed  true if adding new lot should be available
         */
        function determineLotMessage(selectedItem, orderableGroup, addMissingLotAllowed) {
            if (selectedItem.lot) {
                selectedItem.displayLotMessage = selectedItem.lot.lotCode;
            } else {
                var messageKey = lotsOf(orderableGroup, addMissingLotAllowed).length > 0
                    ? 'noLotDefined' : 'productHasNoLots';
                selectedItem.displayLotMessage = messageService.get('orderableGroupService.' + messageKey);
            }
        }
        // SELV3-142: ends here

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name groupByOrderableId
         *
         * @description
         * Groups product items by orderable id.
         *
         * @param {Array} items             product items to be grouped
         * @return {Array}                  items grouped by orderable id.
         */
        function groupByOrderableId(items) {
            return _.chain(items)
                .groupBy(function(item) {
                    return item.orderable.id;
                })
                .values()
                .value();
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name findAvailableProductsAndCreateOrderableGroups
         *
         * @description
         * Finds available Stock Products by facility and program, then groups product items
         * by orderable id.
         */
        function findAvailableProductsAndCreateOrderableGroups(programId, facilityId, includeApprovedProducts) {
            var repository;
            if (includeApprovedProducts) {
                repository = new StockCardSummaryRepository(new FullStockCardSummaryRepositoryImpl());
            } else {
                repository = new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl());
            }

            return repository.query({
                programId: programId,
                facilityId: facilityId
            }).then(function(summaries) {
                return groupByOrderableId(summaries.content.reduce(function(items, summary) {
                    summary.canFulfillForMe.forEach(function(fulfill) {
                        items.push(fulfill);
                    });
                    return items;
                }, []));
            });
        }

        // SELV3-142: Added lot-management feature
        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name areOrderablesUseVvm
         *
         * @description
         * Find product in orderable group based on lot.
         *
         * @param  {Object}  orderableGroup orderable group
         * @param  {Object}  selectedLot    selected lot
         * @param  {boolean} isNewLot       true if lot is not saved yet
         * @return {Object}                 found product
         */
        function findByLotInOrderableGroup(orderableGroup, selectedLot, isNewLot) {
            var selectedItem = _.chain(orderableGroup)
                .find(function(groupItem) {
                    var selectedNoLot = !groupItem.lot && (!selectedLot || selectedLot === noLotDefined),
                        lotMatch = groupItem.lot && groupItem.lot === selectedLot;
                    return selectedNoLot || lotMatch || isNewLot;
                })
                .value();

            // cleared SOH because of new lot entry
            if (isNewLot) {
                var copiedSelectedItem = angular.copy(selectedItem);
                copiedSelectedItem.lot = selectedLot;
                copiedSelectedItem.stockOnHand = 0;
                determineLotMessage(copiedSelectedItem, orderableGroup);
                return copiedSelectedItem;
            }

            if (selectedItem) {
                determineLotMessage(selectedItem, orderableGroup);
            }
            return selectedItem;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name addItemWithNewLot
         *
         * @description
         * Creates new item from similar orderable + lot item and newly created lot.
         *
         * @param  {Object} newLot      newly created lot
         * @param  {Object} similarItem object with orderable field to be used
         * @return {Object}             item created from passed parameters
         */
        function addItemWithNewLot(newLot, similarItem) {
            var newItem = angular.copy(similarItem);

            newItem.id = undefined;
            newItem.lot = angular.copy(newLot);
            newItem.stockOnHand = 0;
            newItem.$isNewItem = true;
            determineLotMessage(newItem);

            return newItem;
        }
        // SELV3-142: ends here

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name areOrderablesUseVvm
         *
         * @description
         * Determines if any orderable in orderable groups use VVM.
         *
         * @param {Array} orderableGroups   filtered groups
         * @return {boolean}                true if any orderable has useVVM property 'true'
         */
        function areOrderablesUseVvm(orderableGroups) {
            var groupsWithVVM = orderableGroups.filter(filterOrderablesThatUseVvm);
            return groupsWithVVM.length > 0;
        }

        function filterOrderablesThatUseVvm(group) {
            var extraData = group[0].orderable.extraData;
            return extraData !== null && extraData !== undefined && extraData.useVVM === 'true';
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name getKitOnlyOrderablegroup
         *
         * @description
         * Return Kit only orderable groups
         *
         * @param {Array} orderableGroups   orderable groups
         * @return {Array}                Kit orderable groups
         */
        function getKitOnlyOrderablegroup(orderableGroups) {
            return orderableGroups
                .map(removeNonKitOrderables)
                .filter(isGroupNotEmpty);
        }

        function removeNonKitOrderables(stockOrderableGroups) {
            return stockOrderableGroups.filter(function(group) {
                return group.orderable.children.length > 0;
            });
        }

        function isGroupNotEmpty(group) {
            return group.length > 0;
        }

    }

})();