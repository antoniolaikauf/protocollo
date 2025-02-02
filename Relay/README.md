# NODO

i nodi che andrò a creare dovrà creare l'altra chiave che permette la creazione dell'address P2SH e anche lo sblocco dei
suoi fondi, ovviamente alla creazione dell'address il nodo non dovrà rilevare la sua chiave, ma la dovrà tenere nascosta.
Solo alla fine il nodo quando è avvenuto il burn e verificato che sia avvenuto potrà rilevare la chiave all'utente.

Questo è il ragionamento base che ho pensato, ovviamente ci sono dei punti di domanda

- Cosa succede se il nodo perde la chiave?
- Cosa succede se il nodo a quell'ora è offline?
- Cosa succede se non vuole dare la chiave al utente?
- Cosa succede se il nodo da la chiave sbagliata?

Tutte queste domande si può rispondere con la parola **SLASHING** (penso). <br>
Inoltre ci deve essere un modo che permetta il rilascio della chiave associata all'utente correttemente

Ci sono delle precauzioni per permette che il nodo si comporta il più bene possibile o che permettono di diminuire il rischio di perdita della chiave? <br>
**dividere la chiave tra più nodi** non so se è possibile creare un implemetazione in cui anhe se un nodo si rifiuta di consegnare la chiave è abbastanza che i 2/3 della chiave vadano bene per permettere all'utente di sbloccare i fondi dall'address P2SH.
si potrebbe fare un meccanismo in cui i nodi hanno due pezzi di chiave e cosi permette di ricreare la chiave senza avere tutti i nodi che siano onnline, o anche implementare il **secret sharing**

es.

```markdown
ho la chiave 191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9
```

```markdown
ogni nodo ha due parti diverse della chiave
nodo 1 191c609103e968dc - 71954d68c8fbe198
nodo 2 40673827c672a81e - 645987b8b514b9e9
nodo 3 191c609103e968dc - 645987b8b514b9e9
nodo 4 71954d68c8fbe198 - 40673827c672a81e
```
```markdown
in questo caso servirebbe minimo due nodi per craere la chiave 1 - 2 e 3 - 4 
e massimo tre nodi per creare la chiave 1 - 3 - 4, 2 - 3 - 4  
```

<br>
O se un nodo va offline ha un limite di tempo per il quale deve ritornare online. <br>
Si potrebbe aggiungere rindondanza cosi che se un nodo va offline un altro nodo può sostituirlo

Ovviamente inoltre il nodo avrà del collaterale da mettere e questo dovrà essere sempre maggiore rispetto al deposito che dovrà fare l'utente