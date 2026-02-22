using myservice as service from '../../srv/service';
using from '../../db/schema';

annotate service.Customer with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'customerId',
                Value : customerId,
            },
            {
                $Type : 'UI.DataField',
                Label : 'customerName',
                Value : customerName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'email',
                Value : email,
            },
            {
                $Type : 'UI.DataField',
                Label : 'phoneNumber',
                Value : phoneNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'address',
                Value : address,
            },
            {
                $Type : 'UI.DataField',
                Value : CustomerToHobbies.Hobby_HobbyID,
                Label : 'Hobby_HobbyID',
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Orders',
            ID : 'Orders',
            Target : 'CustomerToOrders/@UI.LineItem#Orders',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'customerId',
            Value : customerId,
        },
        {
            $Type : 'UI.DataField',
            Label : 'customerName',
            Value : customerName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'email',
            Value : email,
        },
        {
            $Type : 'UI.DataField',
            Label : 'phoneNumber',
            Value : phoneNumber,
        },
        {
            $Type : 'UI.DataField',
            Label : 'address',
            Value : address,
        },
    ],
);

annotate service.Customer with {
    Hobbies @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Customer',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : Hobbies,
                    ValueListProperty : 'Hobbies_HobbyID',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
)};

annotate service.Customer with {
    hobbiesdp @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'ZHobby',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : hobbiesdp_HobbyID,
                    ValueListProperty : 'HobbyName',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
)};

annotate service.CustomerHobby with {
    Hobby @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'ZHobby',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : Hobby_HobbyID,
                    ValueListProperty : 'HobbyName',
                },
            ],
        },
        Common.ValueListWithFixedValues : true,
)};

annotate service.Orders with @(
    UI.LineItem #Orders : [
        {
            $Type : 'UI.DataField',
            Value : orderId,
            Label : 'orderId',
        },
        {
            $Type : 'UI.DataField',
            Value : orderAmount,
            Label : 'orderAmount',
        },
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'general section',
            ID : 'generalsection',
            Target : '@UI.FieldGroup#generalsection',
        },
    ],
    UI.FieldGroup #generalsection : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : customerId,
                Label : 'customerId',
            },
            {
                $Type : 'UI.DataField',
                Value : orderAmount,
                Label : 'orderAmount',
            },
            {
                $Type : 'UI.DataField',
                Value : orderDate,
                Label : 'orderDate',
            },
            {
                $Type : 'UI.DataField',
                Value : orderId,
                Label : 'orderId',
            },
            {
                $Type : 'UI.DataField',
                Value : status,
                Label : 'status',
            },
            {
                $Type : 'UI.DataField',
                Value : msgValue,
                Label : 'msgValue',
            },
            {
                $Type : 'UI.DataField',
                Value : valueFitValue,
                Label : 'valueFitValue',
            },
        ],
    },
);

