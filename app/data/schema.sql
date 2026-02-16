-- =========================================================================
-- SCHEMA DEL DATABASE LogSpot
-- Piattaforma per la logopedia italiana
-- Questo file definisce la struttura di tutte le tabelle del database SQLite
-- =========================================================================

-- 1. Tabella LOGOPEDISTA
-- Contiene i dati anagrafici e le credenziali di accesso dei logopedisti registrati
CREATE TABLE Logopedista (
    pIva VARCHAR(11) PRIMARY KEY,            -- Partita IVA del logopedista (chiave primaria, 11 caratteri)
    cognome TEXT NOT NULL,                    -- Cognome del logopedista (obbligatorio)
    nome TEXT NOT NULL,                       -- Nome del logopedista (obbligatorio)
    dataNascita DATE,                         -- Data di nascita del logopedista (opzionale)
    numTelefono TEXT,                         -- Numero di telefono del logopedista (opzionale)
    email TEXT UNIQUE NOT NULL,               -- Indirizzo email univoco del logopedista (obbligatorio)
    password TEXT NOT NULL                    -- Password di accesso del logopedista (obbligatoria)
);

-- 2. Tabella PAZIENTE
-- Contiene i dati anagrafici, le credenziali e l'eventuale logopedista assegnato per ogni paziente
CREATE TABLE Paziente (
    cf VARCHAR(16) PRIMARY KEY,              -- Codice fiscale del paziente (chiave primaria, 16 caratteri)
    cognome TEXT NOT NULL,                    -- Cognome del paziente (obbligatorio)
    nome TEXT NOT NULL,                       -- Nome del paziente (obbligatorio)
    dataNascita DATE,                         -- Data di nascita del paziente (opzionale)
    numTelefono TEXT,                         -- Numero di telefono del paziente (opzionale)
    email TEXT UNIQUE NOT NULL,               -- Indirizzo email univoco del paziente (obbligatorio)
    password TEXT NOT NULL,                   -- Password di accesso del paziente (obbligatoria)
    -- Relazione "Segue": un paziente può essere seguito da 0 o 1 logopedista
    id_logopedista VARCHAR(11),               -- Chiave esterna: P.IVA del logopedista che segue il paziente (può essere NULL se non assegnato)
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE SET NULL
    -- ON DELETE SET NULL: se il logopedista viene eliminato, il paziente non viene cancellato ma resta senza logopedista
);

-- 3. Tabella ATTIVITÀ
-- Contiene i materiali/attività didattiche creati dai logopedisti per i pazienti
CREATE TABLE Attivita (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,   -- Codice univoco dell'attività, auto-incrementale
    dataCreazione DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e ora di creazione, impostata automaticamente
    titolo TEXT NOT NULL,                     -- Titolo dell'attività (obbligatorio)
    descrizione TEXT,                         -- Descrizione testuale dell'attività (opzionale)
    istruzioni TEXT,                          -- Istruzioni/obiettivi per svolgere l'attività (opzionale)
    immagine TEXT,                            -- URL o percorso delle immagini associate (separate da "|" se multiple, opzionale)
    accessibilita BOOLEAN DEFAULT 0,          -- Flag di accessibilità pubblica: 0 = privata, 1 = pubblica (default: privata)
    fasciaEta INTEGER DEFAULT 0,              -- Fascia d'età consigliata per l'attività (default: 0 = tutte le età)
    patologie TEXT,                           -- Patologie target, separate da virgola (es. "DISLALIA,AFASIA", opzionale)
    -- Relazione "Crea": ogni attività è creata da un logopedista (relazione 1:N)
    id_logopedista VARCHAR(11) NOT NULL,      -- Chiave esterna: P.IVA del logopedista creatore (obbligatoria)
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE
    -- ON DELETE CASCADE: se il logopedista viene eliminato, anche le sue attività vengono cancellate
);

-- 4. Tabella MATERIALE
-- Contiene i materiali didattici (domande, immagini, ecc.) associati a ciascuna attività
-- Relazione 1:N con Attività: un'attività può avere più materiali
CREATE TABLE Materiale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- ID univoco del materiale, auto-incrementale
    tipo TEXT,                                -- Tipo di materiale: 'immagine', 'testo', 'video', ecc. (opzionale)
    immagine TEXT,                            -- URL o percorso dell'immagine del materiale (opzionale)
    domanda TEXT,                             -- Testo della domanda associata al materiale (opzionale)
    risposta TEXT,                            -- Risposta corretta alla domanda (opzionale)
    rispFalsa TEXT,                           -- Risposta errata/distrattore per la domanda (opzionale)
    -- Relazione "Contiene": collega il materiale alla sua attività padre
    id_attivita INTEGER NOT NULL,             -- Chiave esterna: codice dell'attività a cui appartiene (obbligatoria)
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE
    -- ON DELETE CASCADE: se l'attività viene eliminata, anche i suoi materiali vengono rimossi
);

-- 5. Tabella ESERCIZIO
-- Rappresenta l'assegnazione di un'attività a un paziente da parte di un logopedista
-- È la tabella di relazione ternaria tra Attività, Logopedista e Paziente
CREATE TABLE Esercizio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- ID univoco dell'esercizio assegnato, auto-incrementale
    dataAssegnazione DATE,                    -- Data in cui l'esercizio è stato assegnato al paziente
    statoCompletamento TEXT,                  -- Stato corrente: 'da-svolgere', 'in-corso', 'completato' (opzionale)
    durata INTEGER,                           -- Durata dell'esercizio in secondi o minuti (opzionale)
    esito TEXT,                               -- Esito dell'esercizio: 'positivo', 'parziale', 'nullo', ecc. (opzionale)
    -- Relazione "Costituisce": collega l'esercizio all'attività da cui è derivato (Attività -> Esercizio)
    id_attivita INTEGER NOT NULL,             -- Chiave esterna: codice dell'attività collegata (obbligatoria)
    -- Relazione "Somministra": il logopedista che ha assegnato l'esercizio (Logopedista -> Esercizio)
    id_logopedista VARCHAR(11) NOT NULL,      -- Chiave esterna: P.IVA del logopedista che ha assegnato (obbligatoria)
    -- Relazione "Svolge": il paziente a cui è assegnato l'esercizio (Paziente -> Esercizio)
    id_paziente VARCHAR(16) NOT NULL,         -- Chiave esterna: codice fiscale del paziente (obbligatoria)
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE,       -- Se l'attività viene eliminata, l'esercizio viene rimosso
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE, -- Se il logopedista viene eliminato, l'esercizio viene rimosso
    FOREIGN KEY (id_paziente) REFERENCES Paziente(cf) ON DELETE CASCADE          -- Se il paziente viene eliminato, l'esercizio viene rimosso
);

-- 6. Tabella FEEDBACK
-- Contiene i feedback inviati dai pazienti relativamente agli esercizi svolti
-- Relazione 1:1 con Esercizio: ogni feedback è associato a un singolo esercizio
CREATE TABLE Feedback (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,   -- Codice univoco del feedback, auto-incrementale
    messaggio TEXT,                           -- Testo del feedback scritto dal paziente (opzionale)
    data DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e ora di invio del feedback, impostata automaticamente
    -- Relazione "Invia": il paziente che ha inviato il feedback
    id_paziente VARCHAR(16) NOT NULL,         -- Chiave esterna: codice fiscale del paziente che ha inviato il feedback (obbligatoria)
    -- Relazione "Riceve": l'esercizio a cui si riferisce il feedback
    id_esercizio INTEGER NOT NULL,            -- Chiave esterna: ID dell'esercizio a cui è associato il feedback (obbligatoria)
    FOREIGN KEY (id_paziente) REFERENCES Paziente(cf) ON DELETE CASCADE,   -- Se il paziente viene eliminato, il suo feedback viene rimosso
    FOREIGN KEY (id_esercizio) REFERENCES Esercizio(id) ON DELETE CASCADE  -- Se l'esercizio viene eliminato, il feedback associato viene rimosso
);

-- 7. Tabella COMMENTO
-- Contiene i commenti scritti dai logopedisti sulle attività (recensioni, suggerimenti, ecc.)
CREATE TABLE Commento (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,   -- Codice univoco del commento, auto-incrementale
    messaggio TEXT,                           -- Testo del commento (opzionale)
    data DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e ora di creazione del commento, impostata automaticamente
    id_logopedista VARCHAR(11) NOT NULL,      -- Chiave esterna: P.IVA del logopedista autore del commento (obbligatoria)
    id_attivita INTEGER NOT NULL,             -- Chiave esterna: codice dell'attività commentata (obbligatoria)
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE, -- Se il logopedista viene eliminato, i suoi commenti vengono rimossi
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE         -- Se l'attività viene eliminata, i commenti associati vengono rimossi
);

-- 8. Tabella PREFERITI
-- Tabella di giunzione per la relazione N:N tra Logopedista e Attività
-- Permette a un logopedista di salvare come preferite le attività che desidera
CREATE TABLE Preferiti (
    dataSalvataggio DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e ora in cui l'attività è stata aggiunta ai preferiti
    id_logopedista VARCHAR(11) NOT NULL,      -- Chiave esterna: P.IVA del logopedista che ha salvato l'attività (obbligatoria)
    id_attivita INTEGER NOT NULL,             -- Chiave esterna: codice dell'attività salvata come preferita (obbligatoria)
    PRIMARY KEY (id_logopedista, id_attivita), -- Chiave primaria composta: ogni coppia logopedista-attività è univoca
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE, -- Se il logopedista viene eliminato, i suoi preferiti vengono rimossi
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE         -- Se l'attività viene eliminata, i preferiti associati vengono rimossi
);