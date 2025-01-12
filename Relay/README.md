https://api.blockchair.com/bitcoin/nodes

per ora otterrò le transazioni tramite api (ora sto usando la testnet come prova e test) più avanti si proverà a chiedere
direttamente ai nodi le transazioni degli address come in rem e wormhole

processo di rem per il lock and mint After witnessing the locking of assets, RenVM returns a “minting signature” to the user

RenVM uses the RZL MPC algorithm to produce and return a minting signature to Alice.


https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm 


alla validazione c'è un problema essendo che se esegue due transazioni uguali e una di esse è gia stata eseguita e l'altra no allora questa verrà eseguita ancora 

ci facciamo dare la transazione e noi prendiamo l'address a cui ha inviato i soldi e controlliamo se è presente la transazione che ci ha fornito 