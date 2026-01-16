sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Input",
    "sap/m/VBox",
    "sap/m/Button",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    Dialog,
    Input,
    VBox,
    Button,
    MessageToast
) {
    "use strict";

    return Controller.extend("orderproject.controller.View1", {

        /* ===================== INIT ===================== */
        onInit: function () {
            const oWizardModel = new JSONModel({
                customer: {},
                order: {},
                payment: {},
                selectedCustomerId: null,
                selectedCustomerName:null,
                selectedCustomerEmail:null,
                showOrderButton: false,
                showPaymentButton: false,
                showReviewButton:false,
                showReview:false
            });

            this.getView().setModel(oWizardModel, "wizard");
        },

        /* ===================== STEP 1: CUSTOMER ===================== */

        onCreateCustomerPress: function () {

            if (!this._oCustomerDialog) {
                this._oCustomerDialog = new Dialog({
                    title: "Create Customer",
                    contentWidth: "400px",
                    content: new VBox({
                        items: [
                            new Input({ placeholder: "Customer Name", value: "{dialog>/customerName}" }),
                            new Input({ placeholder: "Email", value: "{dialog>/email}" }),
                            new Input({ placeholder: "Phone Number", value: "{dialog>/phoneNumber}" }),
                            new Input({ placeholder: "Address", value: "{dialog>/address}" })
                        ]
                    }),
                    beginButton: new Button({
                        text: "Submit",
                        type: "Emphasized",
                        press: this.onSubmitCustomer.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => this._oCustomerDialog.close()
                    })
                });

                this._oCustomerDialog.setModel(new JSONModel({}), "dialog");
                this.getView().addDependent(this._oCustomerDialog);
            }

            this._oCustomerDialog.open();
        },

        onSubmitCustomer: async function () {
            const oDialogModel = this._oCustomerDialog.getModel("dialog");
            const oData = oDialogModel.getData();
            const oModel = this.getView().getModel();

            if (!oData.customerName) {
                MessageToast.show("Customer Name is required");
                return;
            }

            const sCustomerId = "CUST-" + Date.now();

            const oContext = oModel.bindList("/Customer").create({
                customerId: sCustomerId,
                customerName: oData.customerName,
                email: oData.email,
                phoneNumber: oData.phoneNumber,
                address: oData.address
            });

            await oContext.created();

            this.byId("customerTable").getBinding("items").refresh();

            this._oCustomerDialog.close();
            oDialogModel.setData({});

            MessageToast.show("Customer created successfully");
        },

        onCustomerTableSelect: function (oEvent) {
            debugger
            const oWizard = this.getView().getModel("wizard");
            const oItem = oEvent.getParameter("listItem");

            if (!oItem) {
                return;
            }

            const sCustomerId = oItem.getBindingContext().getProperty("customerId");
            const sCustomerName = oItem.getBindingContext().getProperty("customerName");
            const sCustomeremail= oItem.getBindingContext().getProperty("email");

            oWizard.setProperty("/selectedCustomerId", sCustomerId);
            oWizard.setProperty("/selectedCustomerName", sCustomerName);
            oWizard.setProperty("/selectedCustomerEmail", sCustomeremail);
            oWizard.setProperty("/showOrderButton", true);

        },
        onCustomerItemPress: function (oEvent) {
            debugger
            const oTable = this.byId("customerTable");
            const oWizard = this.getView().getModel("wizard");

            const oItem = oEvent.getParameter("listItem");

            // 🔥 If same item is already selected → deselect
            if (oItem && oItem.getSelected()) {
                oTable.removeSelections(true);

                oWizard.setProperty("/selectedCustomerId", null);
                oWizard.setProperty("/showOrderButton", false);
            }
        },






        onProceedToOrder: function () {
            const oWizard = this.getView().getModel("wizard");
            oWizard.setProperty("/showOrderButton", false);

            this.byId("customerWizard").nextStep();
            const oWizardModel = this.getView().getModel("wizard");

            oWizardModel.setProperty("/order", {
                orderId: "ORD-" + Date.now(),
                orderDate: null,
                orderAmount: null,
                status: "Pending"
            });

        },

        /* ===================== STEP 2: ORDER ===================== */

onOrderFieldChange: function (oEvent) {
    const oWizardModel = this.getView().getModel("wizard");

    // 🔑 Get live value directly from event
    const sValue = oEvent.getParameter("value");

    // Get order object
    const oOrder = oWizardModel.getProperty("/order") || {};

    // --- Date validation ---
    const bDateFilled =
        oOrder.orderDate !== null &&
        oOrder.orderDate !== undefined &&
        oOrder.orderDate !== "";

    // --- Amount validation (from event!) ---
    const bAmountFilled =
        sValue !== "" &&
        !isNaN(sValue) &&
        Number(sValue) > 0;

    const bFilled = bDateFilled && bAmountFilled;

    oWizardModel.setProperty("/showPaymentButton", bFilled);

    console.log("LIVE CHECK:", {
        date: oOrder.orderDate,
        liveAmount: sValue,
        showButton: bFilled
    });
},


       onPaymentFieldChange: function (oEvent) {
    const oWizardModel = this.getView().getModel("wizard");

    
    const sLiveValue = oEvent.getParameter("value");
       

    const oPayment = oWizardModel.getProperty("/payment") || {};

    // --- Payment Date validation ---
    const bDateFilled =
        oPayment.paymentDate !== null &&
        oPayment.paymentDate !== undefined &&
        oPayment.paymentDate !== "";

    // --- Amount validation ---
    const bAmountFilled =
        sLiveValue !== undefined
            ? !isNaN(sLiveValue) && Number(sLiveValue) > 0   // liveChange
            : !isNaN(oPayment.amount) && Number(oPayment.amount) > 0; // change event

    const bValid = bDateFilled && bAmountFilled;

    oWizardModel.setProperty("/showReviewButton", bValid);

    console.log("PAYMENT LIVE CHECK:", {
        date: oPayment.paymentDate,
        amount: sLiveValue ?? oPayment.amount,
        showReview: bValid
    });
},



        onProceedToPayment: function () {
            const oWizard = this.getView().getModel("wizard");
            oWizard.setProperty("/showPaymentButton", false);

            this.byId("customerWizard").nextStep();

            const oWizardModel = this.getView().getModel("wizard");
            oWizardModel.setProperty("/payment", {
                paymentId: "PAY-" + Date.now(),
                paymentDate: null,
                amount: oWizardModel.getProperty("/order/orderAmount"),

            });
        },

onShowReview: function () {
    this.byId("customerWizard").nextStep();
}

,

        /* ===================== STEP 4: review ===================== */

        onSubmitWizard: async function () {
            const oWizardModel = this.getView().getModel("wizard");
            const oModel = this.getView().getModel();

            const sCustomerId = oWizardModel.getProperty("/selectedCustomerId");

            if (!sCustomerId) {
                MessageToast.show("Please select a customer");
                return;
            }

            const oOrderPayload = {
                orderId: oWizardModel.getProperty("/order/orderId"),
                orderDate: oWizardModel.getProperty("/order/orderDate"),
                orderAmount: oWizardModel.getProperty("/order/orderAmount"),
                status: oWizardModel.getProperty("/order/status"),

                OrderToPayment: {
                    paymentId: oWizardModel.getProperty("/payment/paymentId"),
                    paymentDate: oWizardModel.getProperty("/payment/paymentDate"),
                    amount: oWizardModel.getProperty("/payment/amount")
                }
            };


            const sPath = `/Customer('${sCustomerId}')/CustomerToOrders`;

            await oModel.bindList(sPath).create(oOrderPayload).created();

            MessageToast.show("Order & Payment saved successfully 🎉");

            this._resetWizard();
        },
        onCancelWizard:async function () {
                this._resetWizard();
        },


        _resetWizard: function () {
            const oView = this.getView();
            const oWizardModel = oView.getModel("wizard");
            const oWizard = this.byId("customerWizard");

            /* ===============================
               1️⃣ Reset Wizard MODEL
               =============================== */
            oWizardModel.setData({
                customer: {},
                order: {},
                payment: {},
                selectedCustomerId: null,
                showOrderButton: false,
                showPaymentButton: false,
                showReviewButton:false,
                showReview:false
            }, true); // true = merge = false → full reset

            /* ===============================
               2️⃣ Reset Wizard STEPS
               =============================== */
            oWizard.discardProgress(oWizard.getSteps()[0]);
            oWizard.goToStep(this.byId("stepCustomer"));

            /* ===============================
               3️⃣ Reset UI SELECTION
               =============================== */
            const oTable = this.byId("customerTable");
            if (oTable) {
                oTable.removeSelections(true);
            }

            /* ===============================
               4️⃣ Reset Validation / State
               =============================== */
            oWizard.setCurrentStep(this.byId("stepCustomer"));
        }


    });
});
