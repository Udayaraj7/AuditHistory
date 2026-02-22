const cds = require('@sap/cds');
const { SELECT, INSERT, CREATE } = require('@sap/cds/lib/ql/cds-ql');


module.exports = cds.service.impl(function (srv) {



    let { Customer, AuditHistoryCustomer, AuditHistory } = this.entities;
    const { uuid } = cds.utils;

     this.before('CREATE', Customer.drafts, async (req) => {
        debugger;
        const tx = cds.transaction(req);

        const result = await tx.run(
            SELECT.one
                .from(Customer)
                .columns('customerNo')
                .orderBy({ customerNo: 'desc' })
        );

        const nextNo = result ? result.customerNo + 1 : 1;

        req.data.customerNo = nextNo;
        req.data.customerId = `C${nextNo}`;
    });


    



    this.before('UPDATE', Customer, async (req) => {
        const oldData = await SELECT.one
            .from(Customer)
            .where({ customerId: req.data.customerId });

        req._oldCustomerData = oldData;
    });

    this.after('UPDATE', Customer, async (data, req) => {
        if (!req._oldCustomerData) return;

        console.log("after-----------------------------------")
        
     //full record
        await INSERT.into(AuditHistoryCustomer).entries({
            customerId: req._oldCustomerData.customerId,
            customerName: req._oldCustomerData.customerName,
            email: req._oldCustomerData.email,
            phoneNumber: req._oldCustomerData.phoneNumber,
            address: req._oldCustomerData.address
        });


        //only changed fields
        console.log("---------",data);

        //new data
        const newData = data;


        if (req._oldCustomerData.customerName !== newData.customerName) {
            await INSERT.into(AuditHistory).entries({
                customerId: req._oldCustomerData.customerId,
                fieldName: "customerName",
                value: req._oldCustomerData.customerName
            });
        }

        if (req._oldCustomerData.email !== newData.email) {
            await INSERT.into(AuditHistory).entries({
                customerId: req._oldCustomerData.customerId,
                fieldName: "email",
                value: req._oldCustomerData.email
            });
        }

        if (req._oldCustomerData.phoneNumber !== newData.phoneNumber) {
            await INSERT.into(AuditHistory).entries({
                customerId: req._oldCustomerData.customerId,
                fieldName: "phoneNumber",
                value: req._oldCustomerData.phoneNumber
            });
        }

        if (req._oldCustomerData.address !== newData.address) {
            await INSERT.into(AuditHistory).entries({
                customerId: req._oldCustomerData.customerId,
                fieldName: "address",
                value: req._oldCustomerData.address
            });
        }


    });





});

















