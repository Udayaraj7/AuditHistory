sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/Token"
], function (ControllerExtension, Token) {
    "use strict";

    return ControllerExtension.extend("project1.ext.controller.CustomerObject", {

        override: {
            routing: {
                onAfterBinding: function () {
                    debugger;
                    var oTable = sap.ui.core.Element.getElementById(
                        "project1::CustomerObjectPage--fe::table::CustomerToOrders::LineItem::Orders-innerTable"
                    );

                    if (!oTable) {
                        console.warn("Table not found!");
                        return;
                    }

                   
                    oTable.attachEvent("updateFinished", function () {
                        debugger

                        var aItems = oTable.getItems();

                        if (!aItems || aItems.length === 0) {
                            console.warn("No rows available yet");
                            return;
                        }

                        aItems.forEach(function (oItem) {
                            debugger

                            var oContext = oItem.getBindingContext();
                            if (!oContext) return;

                            // 🔍 Find MultiInput inside row
                            var oMultiInput = oItem.findAggregatedObjects(true, function (oControl) {
                                return oControl.isA("sap.m.MultiInput");
                            })[0];

                            if (!oMultiInput) return;

                            var sValue = oContext.getProperty("msgValue");
                            sValue="value1|value10|value100";
                            var bIsActive = oContext.getProperty("IsActiveEntity");
                            var bIsEditable = !bIsActive;

                            // 🚀 Avoid unnecessary rebuild
                            var aExistingTokens = oMultiInput.getTokens();
                            var sExistingKeys = aExistingTokens.map(function (t) {
                                return t.getKey();
                            }).join("|");

                            if (sValue === sExistingKeys && aExistingTokens.length > 0) {
                                if (aExistingTokens[0].getEditable() === bIsEditable) {
                                    return;
                                }
                            }

                            // 🔄 Rebuild tokens
                            oMultiInput.removeAllTokens();

                            if (sValue) {
                                sValue.split("|").forEach(function (sKey) {
                                    sKey = sKey.trim();
                                    if (sKey) {
                                        oMultiInput.addToken(new Token({
                                            key: sKey,
                                            text: sKey,
                                            editable: bIsEditable
                                        }));
                                    }
                                });
                            }

                            // ✅ Tooltip update
                            var sTooltip = sValue
                                ? "Selected: " + sValue.split("|").join(", ")
                                : "No selection";

                            oMultiInput.setTooltip(sTooltip);

                        });

                    });
                }
            }
        }

    });
});