-- 1. Tabella LOGOPEDISTA
CREATE TABLE Logopedista (
    pIva VARCHAR(11) PRIMARY KEY,
    cognome TEXT NOT NULL,
    nome TEXT NOT NULL,
    dataNascita DATE,
    numTelefono TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- 2. Tabella PAZIENTE
CREATE TABLE Paziente (
    cf VARCHAR(16) PRIMARY KEY,
    cognome TEXT NOT NULL,
    nome TEXT NOT NULL,
    dataNascita DATE,
    numTelefono TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    -- Relazione "Segue": un paziente può essere seguito da 0 o 1 logopedista
    id_logopedista VARCHAR(11),
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE SET NULL
);

-- 3. Tabella ATTIVITÀ
CREATE TABLE Attivita (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,
    dataCreazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    titolo TEXT NOT NULL,
    descrizione TEXT,
    istruzioni TEXT,
    immagine TEXT,
    accessibilita BOOLEAN DEFAULT 0,
    fasciaEta INTEGER DEFAULT 0,
    patologie TEXT,
    -- Relazione "Crea": ogni attività è creata da un logopedista (1:N)
    id_logopedista VARCHAR(11) NOT NULL,
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE
);

-- 4. Tabella MATERIALE (Relazione 1:1 o 1:N con Attività)
CREATE TABLE Materiale (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    immagine TEXT,
    domanda TEXT,
    risposta TEXT,
    rispFalsa TEXT,
    -- Relazione "Contiene" (1:1 o 1:N a seconda dell'implementazione desiderata)
    id_attivita INTEGER NOT NULL,
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE
);

-- 5. Tabella ESERCIZIO
CREATE TABLE Esercizio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataAssegnazione DATE,
    statoCompletamento TEXT,
    durata INTEGER, -- in secondi o minuti
    esito TEXT,
    -- Relazione "Costituisce" (Attività -> Esercizio)
    id_attivita INTEGER NOT NULL,
    -- Relazione "Somministra" (Logopedista -> Esercizio)
    id_logopedista VARCHAR(11) NOT NULL,
    -- Relazione "Svolge" (Paziente -> Esercizio)
    id_paziente VARCHAR(16) NOT NULL,
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE,
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE,
    FOREIGN KEY (id_paziente) REFERENCES Paziente(cf) ON DELETE CASCADE
);

-- 6. Tabella FEEDBACK (Relazione 1:1 con Esercizio)
CREATE TABLE Feedback (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,
    messaggio TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Relazione "Invia" dal Paziente e "Riceve" dall'Esercizio
    id_paziente VARCHAR(16) NOT NULL,
    id_esercizio INTEGER NOT NULL,
    FOREIGN KEY (id_paziente) REFERENCES Paziente(cf) ON DELETE CASCADE,
    FOREIGN KEY (id_esercizio) REFERENCES Esercizio(id) ON DELETE CASCADE
);

-- 7. Tabella COMMENTO
CREATE TABLE Commento (
    cod INTEGER PRIMARY KEY AUTOINCREMENT,
    messaggio TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Relazione "Pubblica" dal Logopedista
    id_logopedista VARCHAR(11) NOT NULL,
    -- Relazione "Colleziona" dall'Attività
    id_attivita INTEGER NOT NULL,
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE,
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE
);

-- 8. Tabella PREFERITI (Tabella di giunzione per relazione N:N tra Logopedista e Attività)
CREATE TABLE Preferiti (
    dataSalvataggio DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_logopedista VARCHAR(11) NOT NULL,
    id_attivita INTEGER NOT NULL,
    PRIMARY KEY (id_logopedista, id_attivita),
    FOREIGN KEY (id_logopedista) REFERENCES Logopedista(pIva) ON DELETE CASCADE,
    FOREIGN KEY (id_attivita) REFERENCES Attivita(cod) ON DELETE CASCADE
);