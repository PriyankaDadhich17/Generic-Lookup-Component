@isTest
private class InputLookupAuraControllerTest {
    
    static testMethod void Test() {
        
        Account testAccount = new Account();
        testAccount.Name = 'Test Account';
        testAccount.BillingCountry = 'USA';
        testAccount.Country__c = 'USA';
        Database.Saveresult accountResult = Database.insert(testAccount);
        System.assert(accountResult.isSuccess());
        System.assert(testAccount.Id != null);
        
        // the Contact
        Contact testContact = new Contact();
        testContact.LastName = 'Test Contact Last Name';
        testContact.AccountId = testAccount.Id;
        testContact.Email = 'test@email.com';
        Database.Saveresult contactResult = Database.insert(testContact);
        System.assert(contactResult.isSuccess());
        System.assert(testContact.Id != null);
        
        Contact testContact1 = new Contact();
        testContact1.FirstName = 'search name';
        testContact1.LastName = 'search name';
        testContact1.AccountId = testAccount.Id;
        testContact1.Email = 'test@email.com';
        Database.Saveresult contactResult1 = Database.insert(testContact1);
        System.assert(contactResult1.isSuccess());
        System.assert(testContact1.Id != null);
        
        InputLookupAuraController.getCurrentValue(null,null);
        InputLookupAuraController.getCurrentValue('contact','0034565i4545');
        InputLookupAuraController.getCurrentValue('Contact',testContact.id);
        
        Id [] fixedSearchResults= new Id[1];
        fixedSearchResults[0] = testContact1.id;
        Test.setFixedSearchResults(fixedSearchResults);
        
        InputLookupAuraController.searchSObject(null,null);
        InputLookupAuraController.searchSObject('conttttt',null);
        InputLookupAuraController.searchSObject('Contact','Test');
        InputLookupAuraController.searchSObject('Contact','search ');
    }
}