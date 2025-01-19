# ERC20 CBTC
 cBTC sarà il token che avvolgerà BTC e rifletterà il prezzo di BTC, ci possono essere due tipi di asset:
 1. Algorithmic che vengono gestiti dai smart contract (gestiscono la supply e demand)
 2. Centralized che sono conservati in organizzazioni e ogni toto tempo pubbicano la prova delle riserve 


punti da risolvere.
cosa succede se l'utente compra qualcosa sulla blockchain eth con i token cBTC? perchè quello che avrà comprato 
non sta ricevendo i veri BTC 

ora noi nel controllo che si avvenuta la transazione del blocco di BTC stiamo controllando che 
chi manda i dati non abbia inviato gia un address e un nonce associato ad una transazione, si potrebbe implementare che 
un oracle guardi sulla blockchain di btc e controlli che i dati inviati non siano vecchi di tot tempo cosi 
riduciamo ulteriormente il rischio 


https://en.bitcoin.it/wiki/Protocol_documentation#tx