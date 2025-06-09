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
     * @name stock-card.stockCardService
     *
     * @description
     * Responsible for fetching single stock card with line items.
     */
    angular
        .module('stock-card')
        .service('stockCardService', service);

    service.$inject = ['$resource', '$window', 'stockmanagementUrlFactory', 'accessTokenFactory', 'dateUtils',
        'loadingModalService', 'openlmisUrlFactory', 'StockCardResource', '$q', 'offlineService'];

    function service($resource, $window, stockmanagementUrlFactory, accessTokenFactory, dateUtils,
                     loadingModalService, openlmisUrlFactory, StockCardResource, $q, offlineService) {
        var stockCardResource = new StockCardResource();
        var resource = $resource(stockmanagementUrlFactory('/api/stockCards/:stockCardId'), {}, {
            get: {
                method: 'GET',
                transformResponse: transformResponse
            },
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/stockCards/:stockCardId/deactivate')
            }
        });

        this.getStockCard = getStockCard;
        this.print = print;
        this.deactivateStockCards = deactivateStockCards;

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name getStockCard
         *
         * @description
         * Get stock card by id.
         *
         * @param {String} stockCardId stock card UUID
         * @return {Promise} stock card promise.
         */
        function getStockCard(stockCardId) {
            return stockCardResource.get(stockCardId)
                .then(function(stockCard) {
                    if (!stockCard && offlineService.isOffline()) {
                        throw new Error('stockCard.notCached.error');
                    }
                    return $q.resolve(stockCard);
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name deactivateStockCards
         *
         * @description
         * Change stock card active property by id to false.
         *
         * @param {Array} stockCardIds stock card UUIDs
         * @return {Promise} stock card promise.
         */
        function deactivateStockCards(stockCardIds) {
            return resource.update({
                stockCardIds: stockCardIds
            }, null).$promise;
        }

        function print(stockCardId) {
            loadingModalService.open();
            var popup = $window.open('', '_blank');
            popup.location.href = accessTokenFactory.addAccessToken(getPrintUrl(stockCardId));
            loadingModalService.close();
        }

        function getPrintUrl(stockCardId) {
            return openlmisUrlFactory('/api/reports/templates/common/e67b09ad-4cc6-4fd7-83f8-f33e7aea060a/pdf?'
            + 'stockCardId=' + stockCardId);
        }

        function transformResponse(data, headers, status) {
            if (status === 200) {
                var stockCard = angular.fromJson(data);
                if (stockCard.lot && stockCard.lot.expirationDate) {
                    stockCard.lot.expirationDate = dateUtils.toDate(stockCard.lot.expirationDate);
                }
                return stockCard;
            }
            return data;
        }
    }
})();