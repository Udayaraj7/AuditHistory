sap.ui.define([], function () {
    "use strict";

    return {

        /**
                 * Called when user (de)selects one or more items in the MultiComboBox
                          * @param {sap.ui.base.Event} oEvent
                                   */


        formatStringToKeys: function (sValue) {
            if (!sValue) {
                return [];
            }
            // Split by comma and trim each value to remove extra spaces
            return sValue.split("+").map(function (s) {
                return s.trim();
            });
        },

onSelectionChange: function (oEvent) {

    var oMCB = oEvent.getSource();
    //current selected item
    var oChangedItem = oEvent.getParameter("changedItem");
    var bSelected = oEvent.getParameter("selected");

    // Only validate when selecting
    if (!bSelected) {
        oMCB.setValueState("None");
        return;
    }

    var aSelectedItems = oMCB.getSelectedItems();

    // Get all selected texts
    var aTexts = aSelectedItems.map(function (oItem) {
        return oItem.getText();
    });

    // Check duplicates
    var bHasDuplicate = aTexts.length !== new Set(aTexts).size;

    if (bHasDuplicate) {

        
        
        // Show error inside MultiComboBox
        oMCB.setValueState("Error");
        oMCB.setValueStateText("Duplicate values are not allowed.");

        // Remove the newly selected duplicate
        oMCB.removeSelectedItem(oChangedItem);


    } 
    else {
        // Clear error if valid
        oMCB.setValueState("None");
    }
}

,


        onSelectionFinish: function (oEvent) {
            debugger
            var oMCB = oEvent.getSource();

            // get selected items (not keys)
            var aItems = oMCB.getSelectedItems();


            // extract text values
            var aValues = aItems.map(function (item) {
                return item.getText();
            });

            var sConcatenated = aValues.join("+");

            var oContext = oMCB.getBindingContext();
            if (!oContext) return;

            oContext.setProperty("msgValue", sConcatenated);

            //to clear error state
            oMCB.setValueState("None");
        },




    };
})