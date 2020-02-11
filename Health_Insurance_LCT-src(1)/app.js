/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});
// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

//     var config = { 
//         userName: 'mslct', 
//         password: 'Pass@1234', 
//         server: 'mslct.database.windows.net', 
//         // If you are on Microsoft Azure, you need this: 
//         options: {encrypt: true, database: 'MSLCT'} 
//     }; 
//     var connection = new Connection(config); 
//     connection.on('connect', function(err) { 
//     // If no error, then good to proceed. 
//         console.log("Connected"); 
//         queryDatabase();
//     });   

// function queryDatabase()
//    { console.log('Reading rows from the Table...');

//        // Read all rows from table
//     var request = new Request(
//           "SELECT NAME FROM CLAIM_ADVISOR",
//              function(err, rowCount, rows) 
//                 {
//                     console.log(rowCount + ' row(s) returned');
//                     process.exit();
//                 }
//             );

//      request.on('row', function(columns) {
//         columns.forEach(function(column) {
//             console.log("%s\t%s", column.metadata.colName, column.value);
//          });
//              });
//      connection.execSql(request);
//    }


bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';



// var luisAppId = '64f337ac-5d3e-4de9-9fa9-dd80a9da19aa';
// var luisAPIKey = '2c4b44f3621a4945a29acc4c3de2fcb7';
// var luisAPIHostName = 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

bot.on('conversationUpdate', function(message) {

    // Send a hello message when bot is added
    if (message.membersAdded) {
        message.membersAdded.forEach(function(identity) {
            if (identity.id === message.address.bot.id) {
                var reply = new builder.Message().address(message.address).text("Hi There! I am Health insurance LCT Bot \n I am here to help you find your Claim Details!");
                bot.send(reply);
                
            }
        });
    }
});



// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 


// bot.dialog('GreetingDialog',(session) => {

//     session.send('Hello, I am your Health Insurance Claim finder bot.', session.message.text);
//     builder.Prompts.choice(session,
//         'Hi \n Do you have you account access pin?',
//         ['Yes', 'No'],
//     { listStyle: builder.ListStyle.button });
//     if (results.response.index === 0) {
//         session.send("You've Yes")
//     } else {
//         let msg = "You've selected No";
//         session.endConversation(msg);
//     }
//     session.endDialog();
    
// }).triggerAction({
//        matches: 'Greeting'
//     })


bot.dialog('GreetingDialog',[ 
    function (session) {
        builder.Prompts.text(session, "Hello What's your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        global.name = results.response;
        builder.Prompts.confirm(session, "HI " + name + ', Please provide Access pin to continue');
        //return session.beginDialog('AuthenticationDialog');
    },
    function (session, results) {
        session.userData.coding = results.response;
        // builder.Prompts.confirm(session, "Your Pin is" + coding);
        
    },
    function(session, results){
        season.userData.language = results.response.entity;
        season.endDialog('Got it...' + session.userData.name + 'response is ' + session.userData.coding );
        session.endDialog();
    },
]).triggerAction({
       matches: 'Greeting'
    })



bot.dialog('HelpDialog',
    (session) => {
        session.send('How can i help you', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
})

bot.dialog('CancelDialog',
    (session) => {
        session.send('I didn\'t get your question. Can you please repharase it and ask ', results.response);
        builder.Prompts.choice(session,
            "You can ask questions like:",
            ["1. Counts of pending claim provider Clearance", "2. What are my pending claim ID?", "3. Please provide me detail status for 4785"],
                { listStyle: builder.ListStyle.button });  
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
})

//Custom code for Health Insurance Bot
bot.dialog('AuthenticationDialog',
    [(session) => {
        
          //DB config to SQL

var Connection = require('tedious').Connection;  
    var config = {  
        userName: 'mslct',  
        password: 'Pass@1234',  
        server: 'mslct.database.windows.net',  
        // If you are on Microsoft Azure, you need this:  
        
        options: {encrypt: true, database: 'MSLCT'}  
    };  
    var connection = new Connection(config);  
    connection.emit('connect');
    connection.on('connect', function(err) {  
        
    // If no error, then good to proceed.
      if (err) throw err;  
        console.log("Connected");  
        executeStatement();
       
    });

    // required statements
    var Request = require('tedious').Request;  
    var TYPES = require('tedious').TYPES; 
    
    
    function executeStatement() {  
      var request = new Request("SELECT claim_nbr FROM CLAIM_ADVISOR Where name = '" +name+ "' ;", function(err) {  
        if (err) {  
            console.log(err);}  
        });
          
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                //console.log('NULL');
                console.log('Sorry,You are not a registered user');    
                session.send ("Sorry,You are not a registered user");
              } else {  
                result+= column.value + " ";  
              }  
            });  
            console.log(result);
            global.claim_nbr = result;
            result ="";  
           if  (claim_nbr == " "){
           session.send ("Sorry,You are not a registered user")
        }
        });  

        //request.on('done', function(rowCount, more) {  
        //console.log(rowCount + ' rows returned');  
        //});  
        connection.execSql(request); 
        //if  (emailid === null){
           // session.send ("Sorry,You are not a registered user")
        //}
    } 
    
        
       
        
        session.send('Thank you. Your access pin is Correct. You said \'%s\'.', session.message.text);
        session.send('What would you like to know about your pending claims?');
        builder.Prompts.choice(session,
            "You can ask questions like:",
            ["1. Counts of pending claim provider Clearance", "2. What are my pending claim ID?", "3. Please provide me detail status for 4785"],
                { listStyle: builder.ListStyle.button });  
                
        // session.send('You can ask questions like: \n 1. Counts of pending claim provider Clearance \n 2. What are my pending claim ID? \n 3. Please provide me detail status for 4785');

        session.endDialog();
    }]
).triggerAction({
    matches: 'Authentication'
});

bot.dialog('Claim_idDialog',
    (session) => {
        
        
        session.send('Claim id\'s of pending claims are : 1234 ,4567.', session.message.text);
        session.endDialog();
    }
).triggerAction({
    matches: 'Claim_id'
})





bot.dialog('ClaimCountDialog',
    (session) => {
        session.send('You have <4> claims pending with Health Insurance LCT Provider');
        session.endDialog();
    }
).triggerAction({
    matches: 'ClaimCount'
})

bot.dialog('claimDetailStatusDialog',
    (session) => {
        session.send('Please wait while I fetch info you required!!!');
        setTimeout(function(){
            session.send('Claim is 3456 is regarding your out paitent visited to Dr. Batra on 23rd July 2018');
            session.send('Total billed amount is $500. Already cleared payment is $100. \n Total claim amount to Health Insurance LCT is $400.');
    },3000);
        session.endDialog();
    }
).triggerAction({
    matches: 'claimDetailStatus'
})



        bot.dialog('SmsConfirmaitonDialog',[
            function(session) { 
                builder.Prompts.choice(session,
                    "Confirm your mobile number 789654123",
                    ["Yes", "No"],
                        { listStyle: builder.ListStyle.button });
            
        },
        function(season, results) {
            if (results.response.index === 0) {
                    season.send("You have selected Yes");
                    season.send("Claim Summary for claim id <3456> is sent to your registered mobile. Is there anything else I can help you with?");
            }else{
                season.send("Please Contact your adminstrator to update your mobile number");
                season.send("Is there anything else I can help you with");
                
            }
        }]).triggerAction({
               matches: 'SmsConfirmaiton'
    })

bot.dialog('claimStatusDialog',
    (session) => {
        session.send('Please hold while I retrieve… \n Claim <3456> is currently in "Pending Physician Confirmation" status. ');
        session.endDialog();
    }
).triggerAction({
    matches: 'claimStatus'
})


bot.dialog('closureDateDialog',
    (session) => {
        session.send('Estimated closure date  for Claim 3456 is 25/06/2018');
        session.endDialog();
    }
).triggerAction({
    matches: 'closureDate'
})

bot.dialog('ExitDialog',
    (session) => {
        session.send('You’re welcome. Thank you for using our Health Insurance LCT service.\n Bye for now.');
        session.endDialog();
    }
).triggerAction({
    matches: 'Exit'
})


