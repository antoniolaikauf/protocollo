# protocollo

proverò a creare il mio protocollo layer2

passi

1. capire i concetti di layer 2 e layer 1
2. su che blockchain costruirlo
3. che tipo di layer
4. a cosa servirà

The blockchain trilemma is a problem facing the digital ledger which states that the blockchain cannot achieve decentralization, security, and scalability simultaneously.
and this is a big issue if we want to gain adoption

**layer0**: i protocolli di layer0 sono le reti/l'infrastruttura su cui si costruiscono i layer1
il layer0 può risolvere diversi problemi tra cui il problema dell **Interoperabilità** essendo che se due blockchain si volessero scambiare dati/ comunicare tra di loro si dovrebbe far uso di un **bridge**.
Ma grazie al layer0 le blockchain vengono costruite sulla stessa rete togliendo il problema dei bridge.
Un altro problema che si può risolvere con i layer0 è la **scalabilità** in cui le funzioni crititche possono essere delegate ad altre blockchain evitando rallentamenti sulla rete o colli di bottiglia
vari tipi di layer0 sono: <br>
[Polkadot](https://assets.polkadot.network/Polkadot-whitepaper.pdf) in cui ogni blockchain viene chiamata **parachain** e una catena principale chiamata
**Relay Chain** che permette la comunicazione tra le parachain. <br>
[Cosmos](https://gateway.pinata.cloud/ipfs/QmWXkzM74FCiERdZ1WrU33cqdStUK9dz1A8oEvYcnBAHeo) in cui è composta da una rete principale chiamata **cosmos hub** e da
blockchain personalizzate chiamate **zone**

**layer1**: sono blockchain che possono validare e eseguire le transazioni senza la necessità di un atra rete
queste reti non hanno bisogno di una third party per le transaizoni, possono avvenire quando si ha voglia, mostrano tutte le transazioni senza rilevare chi le ha fatte
si possono costruire applicazioni su alcuni di esse (ETH), una volta eseguite le transazioni non sono riversibili, insomma possono fare tante cosa dalla privacy/sicurezza, a movimentazione
di soldi, a creazioni di applicazioni ecc. ma hanno uno svantaggio che sarebbe la **scalabilità** il **costo**, **token per eseguire le transazioni**.
queste problematiche non avvengono tutte e tre su ogni layer1 per esempio su bitcoin è difficile creare applicazioni o usare altri token essendo che accetta solo BTC
su eth il costo delle transazioni è alto e più si usa la rete e più le ffes (gas) diventano alte.  
**layer2**: vengono utilizzate per alleggerire il crico dei layer1, arrivano in soccorso ai layer2 per sistemare il problema **blockchain trilemma**. <br>
**zkSync** zkSync usa la tecnologia dei Zero-Knowledge Rollup, che offre alta sicurezza grazie alla prova crittografica delle transazioni senza dover rivelare i dettagli delle stesse

| Layer2      | Techology                                 | avarage TX fee         |
| ----------- | ----------------------------------------- | ---------------------- |
| base        | Optimistic Rollup using OP Stack          | $0.002 USD to Send ETH |
| Arbitrum    | Optimistic Rollup & AnyTrust Chain        | $0.01 USD to Send ETH  |
| Optimistic  | Optimistic Rollup & Modular OP Stack      | $0.03 USD to Send ETH  |
| Stacks      | Hybrid Bitcoin L2 with Nakamoto Consensus | $0.20 USD to Send BTC  |

**layer3**: applicazioni che si basano sulla blockchain. Giochi, Wallet, NFT, dex


### perchè avere un layer2 ?

ci possono essere due tipi di soluzioni per migliorare la blockchain rendendola più scalabile.
O si migliora direttamente il layer1 e quindi la blockchain o si crea direttamente protocolli in top alla blockchain per renderal più scalabile senza dover cambiare la blockchain
