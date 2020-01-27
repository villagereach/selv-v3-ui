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

    angular
        .module('referencedata-orderable')
        .factory('OrderableDataBuilder', OrderableDataBuilder);

    OrderableDataBuilder.$inject = ['Orderable', 'ProgramOrderableDataBuilder'];

    function OrderableDataBuilder(Orderable, ProgramOrderableDataBuilder) {

        OrderableDataBuilder.prototype.withFullProductName = withFullProductName;
        OrderableDataBuilder.prototype.withProductCode = withProductCode;
        OrderableDataBuilder.prototype.withId = withId;
        OrderableDataBuilder.prototype.withVersionNumber = withVersionNumber;
        OrderableDataBuilder.prototype.withPrograms = withPrograms;
        OrderableDataBuilder.prototype.withExtraData = withExtraData;
        OrderableDataBuilder.prototype.withIdentifiers = withIdentifiers;
        OrderableDataBuilder.prototype.withNetContent = withNetContent;
        OrderableDataBuilder.prototype.withChildren = withChildren;
        OrderableDataBuilder.prototype.build = build;
        OrderableDataBuilder.prototype.buildJson = buildJson;
        OrderableDataBuilder.prototype.withoutProductCode = withoutProductCode;
        // SELV3-14: expanded orderable data builder by new volume and temperature fields
        OrderableDataBuilder.prototype.withInBoxCubeDimension = withInBoxCubeDimension;
        OrderableDataBuilder.prototype.withMinimumTemperature = withMinimumTemperature;
        OrderableDataBuilder.prototype.withMaximumTemperature = withMaximumTemperature;
        OrderableDataBuilder.prototype.buildForCce = buildForCce;
        // SELV3-14: ends here

        return OrderableDataBuilder;

        function OrderableDataBuilder() {
            OrderableDataBuilder.instanceNumber = (OrderableDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = OrderableDataBuilder.instanceNumber;
            this.id = 'orderable-id-' + instanceNumber;
            this.productCode = 'C' + instanceNumber;
            this.fullProductName = 'Product ' + instanceNumber;
            this.dispensable = {
                displayUnit: ''
            };
            this.description = 'Product ' + instanceNumber + ' description';
            this.netContent = instanceNumber + 1;
            this.packRoundingThreshold = 2;
            this.roundToZero = false;
            this.identifiers = {};
            this.children = [];

            this.programs = [
                new ProgramOrderableDataBuilder()
                    .withFullSupply()
                    .buildJson(),
                new ProgramOrderableDataBuilder()
                    .withOrderableCategoryDisplayOrder(1)
                    .withPricePerPack(20.77)
                    .buildJson()
            ];

            this.meta = {
                versionNumber: '1'
            };
        }

        function withFullProductName(fullProductName) {
            this.fullProductName = fullProductName;
            return this;
        }

        function withId(id) {
            this.id = id;
            return this;
        }

        function withVersionNumber(versionNumber) {
            this.meta.versionNumber = versionNumber;
            return this;
        }

        function withPrograms(programs) {
            this.programs = programs;
            return this;
        }

        function withExtraData(extraData) {
            this.extraData = extraData;
            return this;
        }

        function withIdentifiers(identifiers) {
            this.identifiers = identifiers;
            return this;
        }

        function withNetContent(netContent) {
            this.netContent = netContent;
            return this;
        }

        function withProductCode(productCode) {
            this.productCode = productCode;
            return this;
        }

        function withChildren(children) {
            this.children = children;
            return this;
        }

        function withoutProductCode() {
            this.productCode = undefined;
            return this;
        }

        // SELV3-14: expanded orderable data builder by new volume and temperature fields
        function withInBoxCubeDimension(inBoxCubeDimension) {
            if (inBoxCubeDimension) {
                this.inBoxCubeDimension = {
                    value: inBoxCubeDimension
                };
            }
            return this;
        }

        function withMinimumTemperature(minimumTemperature) {
            if (minimumTemperature) {
                this.minimumTemperature = {
                    value: minimumTemperature
                };
            }
            return this;
        }

        function withMaximumTemperature(maximumTemperature) {
            if (maximumTemperature) {
                this.maximumTemperature = {
                    value: maximumTemperature
                };
            }
            return this;
        }

        function buildForCce(inBoxCubeDimension, minimumTemperature, maximumTemperature) {
            return this.withInBoxCubeDimension(inBoxCubeDimension)
                .withMinimumTemperature(minimumTemperature)
                .withMaximumTemperature(maximumTemperature)
                .buildJson();
        }
        // SELV3-14: ends here

        function build() {
            return new Orderable(this.buildJson());
        }

        function buildJson() {
            return {
                id: this.id,
                programs: this.programs,
                roundToZero: this.roundToZero,
                identifiers: this.identifiers,
                productCode: this.productCode,
                fullProductName: this.fullProductName,
                dispensable: this.dispensable,
                description: this.description,
                netContent: this.netContent,
                packRoundingThreshold: this.packRoundingThreshold,
                extraData: this.extraData,
                children: this.children,
                meta: this.meta,
                // SELV3-14: expanded orderable data builder by new volume and temperature fields
                inBoxCubeDimension: this.inBoxCubeDimension,
                minimumTemperature: this.minimumTemperature,
                maximumTemperature: this.maximumTemperature
                // SELV3-14: ends here
            };
        }

    }

})();
