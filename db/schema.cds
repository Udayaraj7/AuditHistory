namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';


entity Customer {

        @readonly
    key customerId                     : String;
        customerNo                     : Integer;

        @mandatory
        customerName                   : String;

        @mandatory
        email                          : String;

        @mandatory
        @assert.format: '^[0-9]{10}$'
        phoneNumber                    : String;

        @mandatory
        address                        : String;
        CustomerToAuditHistoryCustomer : Composition of many AuditHistoryCustomer
                                             on CustomerToAuditHistoryCustomer.AuditHistoryCustomerToCustomer = $self;
        CustomerToOrders               : Composition of many Orders
                                             on CustomerToOrders.OrdersToCustomer = $self;
        CustomerToAuditHistory         : Composition of many AuditHistory
                                             on CustomerToAuditHistory.AuditHistoryToCustomer = $self;


        CustomerToHobbies              : Composition of many CustomerHobby
                                             on CustomerToHobbies.Customer = $self;
}

entity ZHobby {
    key HobbyID   : String(10);
        HobbyName : String(50);
}

entity CustomerHobby {
    key Customer : Association to Customer;
    key Hobby    : Association to ZHobby;
}


entity msgValueHelp {
    key id    : String(10);
        value : String(20);
}

entity valuefitValueHelp {
    key id    : String(10);
        value : String(20);
}


entity AuditHistoryCustomer : cuid, managed {
    key customerId                     : String;
        customerName                   : String;
        email                          : String;
        phoneNumber                    : String;
        address                        : String;
        AuditHistoryCustomerToCustomer : Association to one Customer
                                             on AuditHistoryCustomerToCustomer.customerId = customerId;

}

entity Orders {
        @readonly
    key customerId       : String;
    key orderId          : String;
        orderDate        : DateTime;
        orderAmount      : Integer;
        status           : String default 'Pending';

        msgValue         : String(2000);
        valueFitValue    : String(10);
        OrdersToCustomer : Association to one Customer
                               on OrdersToCustomer.customerId = customerId;
        OrderToPayment   : Composition of one Payment
                               on OrderToPayment.orderId = $self.orderId;
}


entity Payment {
    key paymentId      : String;

        @readonly
    key orderId        : String;
        paymentDate    : DateTime;
        amount         : Integer;

        PaymentToOrder : Association to one Orders
                             on PaymentToOrder.orderId = orderId;
}


entity AuditHistory : cuid, managed {
    key customerId             : String;
        fieldName              : String;
        value                  : String;
        AuditHistoryToCustomer : Association to one Customer
                                     on AuditHistoryToCustomer.customerId = customerId;

}
