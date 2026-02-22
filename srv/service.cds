using db from '../db/schema';

service myservice {
    @odata.draft.enabled
    entity Customer  as projection on db.Customer;
    entity AuditHistoryCustomer as projection on db.AuditHistoryCustomer;
    entity AuditHistory as projection on db.AuditHistory;
    entity ZHobby as projection on db.ZHobby;

    entity msgValueHelp as projection on db.msgValueHelp;
 
   entity MsgValueHelp_Msg as projection on db.msgValueHelp
  where value like 'msg%';

    entity valuefitValueHelp as projection on db.msgValueHelp
  where value like 'vfit%';
    
    
    
}



