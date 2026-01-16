using db from '../db/schema';

service myservice {
    @odata.draft.enabled
    entity Customer  as projection on db.Customer;
    entity AuditHistoryCustomer as projection on db.AuditHistoryCustomer;
}


service basicService{
    entity Customer  as projection on db.Customer;
    entity Orders as projection on db.Orders;
    entity Payment as projection on db.Payment;

}