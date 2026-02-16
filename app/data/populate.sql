-- =========================================================================
-- POPOLAMENTO DATABASE LogSpot
-- Questo file inserisce i dati di esempio (5 istanze per tabella)
-- da utilizzare per test e demo dell'applicazione
-- =========================================================================

-- =========================
-- 1. LOGOPEDISTA
-- Inserisce 5 logopedisti di esempio con dati anagrafici e credenziali
-- Campi: pIva, cognome, nome, dataNascita, numTelefono, email, password
-- =========================
INSERT INTO Logopedista (pIva, cognome, nome, dataNascita, numTelefono, email, password) VALUES
('12345678901', 'Rossi', 'Maria', '1980-05-12', '3331112222', 'maria.rossi@mail.it', 'pass123'),   -- Logopedista 1: Maria Rossi
('12345678902', 'Bianchi', 'Luca', '1978-03-21', '3332223333', 'luca.bianchi@mail.it', 'pass123'), -- Logopedista 2: Luca Bianchi
('12345678903', 'Verdi', 'Anna', '1985-11-02', '3334445555', 'anna.verdi@mail.it', 'pass123'),     -- Logopedista 3: Anna Verdi
('12345678904', 'Neri', 'Paolo', '1990-07-18', '3336667777', 'paolo.neri@mail.it', 'pass123'),     -- Logopedista 4: Paolo Neri
('12345678905', 'Gallo', 'Sara', '1983-09-30', '3338889999', 'sara.gallo@mail.it', 'pass123');     -- Logopedista 5: Sara Gallo

-- =========================
-- 2. PAZIENTE
-- Inserisce 5 pazienti di esempio, ciascuno assegnato a un logopedista diverso
-- Campi: cf, cognome, nome, dataNascita, numTelefono, email, password, id_logopedista
-- =========================
INSERT INTO Paziente (cf, cognome, nome, dataNascita, numTelefono, email, password, id_logopedista) VALUES
('RSSMRA01A01H501A', 'Rossi', 'Marco', '2015-06-10', '3401111111', 'marco@mail.it', 'pass', '12345678901'), -- Paziente 1: Marco Rossi, seguito da Maria Rossi
('BNCLGU02B02H501B', 'Bianchi', 'Luca', '2012-04-22', '3402222222', 'luca@mail.it', 'pass', '12345678902'), -- Paziente 2: Luca Bianchi, seguito da Luca Bianchi
('VRDANN03C03H501C', 'Verdi', 'Anna', '2010-09-15', '3403333333', 'anna@mail.it', 'pass', '12345678903'), -- Paziente 3: Anna Verdi, seguita da Anna Verdi
('NRIPAO04D04H501D', 'Neri', 'Paolo', '2013-01-19', '3404444444', 'paolo@mail.it', 'pass', '12345678904'), -- Paziente 4: Paolo Neri, seguito da Paolo Neri
('GLLSRA05E05H501E', 'Gallo', 'Sara', '2014-11-05', '3405555555', 'sara@mail.it', 'pass', '12345678905'); -- Paziente 5: Sara Gallo, seguita da Sara Gallo

-- =========================
-- 3. ATTIVITÀ
-- Inserisce 5 attività didattiche di esempio con diversi tipi di patologie e fasce d'età
-- Le prime due sono create da Maria Rossi per renderle visibili nella dashboard demo
-- Campi: titolo, descrizione, istruzioni, immagine, accessibilita (0=privata, 1=pubblica), fasciaEta, patologie, id_logopedista
-- =========================
INSERT INTO Attivita (titolo, descrizione, istruzioni, immagine, accessibilita, fasciaEta, patologie, id_logopedista) VALUES
('Pronuncia vocali', 'Esercizio base sulle vocali', 'Ripetere le vocali lentamente ad alta voce', 'vocali.jpg', 1, 4, 'DISLALIA,RITARDO LINGUAGGIO', '12345678901'),           -- Attività 1: pubblica, fascia 4 anni, creata da Maria Rossi
('Articolazione consonanti', 'Allenamento gruppi consonantici', 'Pronunciare sillabe scandendo bene', 'consonanti.jpg', 1, 6, 'DISARTRIA', '12345678901'),                    -- Attività 2: pubblica, fascia 6 anni, creata da Maria Rossi
('Memoria verbale', 'Esercizi di memoria a breve termine', 'Ascolta la lista e ripeti le parole', 'memoria.jpg', 0, 10, 'AFASIA,ANOMIA', '12345678902'),                     -- Attività 3: privata, fascia 10 anni, creata da Luca Bianchi
('Comprensione frasi', 'Ascolto e comprensione sintattica', 'Rispondere alle domande di controllo', 'frasi.jpg', 1, 8, 'DSL', '12345678903'),                                 -- Attività 4: pubblica, fascia 8 anni, creata da Anna Verdi
('Fluenza verbale', 'Generazione parole per categoria', 'Dire il massimo numero di parole in 1 minuto', 'fluenza.jpg', 0, 12, 'AFASIA,BALBUZIE', '12345678904');              -- Attività 5: privata, fascia 12 anni, creata da Paolo Neri

-- =========================
-- 4. MATERIALE
-- Inserisce 5 materiali didattici di esempio (domande con risposte corrette e distrattori)
-- Ciascun materiale è associato a un'attività tramite id_attivita
-- Campi: tipo (immagine/testo/video), immagine, domanda, risposta (corretta), rispFalsa (distrattore), id_attivita
-- =========================
INSERT INTO Materiale (tipo, immagine, domanda, risposta, rispFalsa, id_attivita) VALUES
('immagine', 'a.jpg', 'Che lettera è?', 'A', 'B', 1),              -- Materiale 1: tipo immagine, collegato all'attività "Pronuncia vocali"
('immagine', 'b.jpg', 'Che suono senti?', 'BA', 'DA', 2),          -- Materiale 2: tipo immagine, collegato all'attività "Articolazione consonanti"
('testo', NULL, 'Ripeti la parola', 'Casa', 'Cosa', 3),            -- Materiale 3: tipo testo (senza immagine), collegato all'attività "Memoria verbale"
('video', NULL, 'Ascolta e rispondi', 'Corretta', 'Errata', 4),    -- Materiale 4: tipo video (senza immagine), collegato all'attività "Comprensione frasi"
('immagine', 'c.jpg', 'Completa la frase', 'Giusto', 'Sbagliato', 5); -- Materiale 5: tipo immagine, collegato all'attività "Fluenza verbale"

-- =========================
-- 5. ESERCIZIO
-- Inserisce 5 esercizi assegnati ai pazienti con diversi stati di completamento
-- Ciascun esercizio collega un'attività, un logopedista e un paziente
-- Campi: dataAssegnazione, statoCompletamento, durata (minuti), esito, id_attivita, id_logopedista, id_paziente
-- =========================
INSERT INTO Esercizio (dataAssegnazione, statoCompletamento, durata, esito, id_attivita, id_logopedista, id_paziente) VALUES
('2026-01-01', 'completato', 10, 'positivo', 1, '12345678901', 'RSSMRA01A01H501A'),   -- Esercizio 1: completato con esito positivo, assegnato da Maria Rossi a Marco Rossi
('2026-01-02', 'in corso', 15, 'parziale', 2, '12345678902', 'BNCLGU02B02H501B'),     -- Esercizio 2: in corso con esito parziale, assegnato da Luca Bianchi a Luca Bianchi
('2026-01-03', 'completato', 20, 'positivo', 2, '12345678903', 'VRDANN03C03H501C'),   -- Esercizio 3: completato con esito positivo, assegnato da Anna Verdi a Anna Verdi
('2026-01-04', 'non iniziato', 10, 'nullo', 4, '12345678904', 'NRIPAO04D04H501D'),    -- Esercizio 4: non iniziato, assegnato da Paolo Neri a Paolo Neri
('2026-01-05', 'completato', 12, 'positivo', 5, '12345678905', 'GLLSRA05E05H501E');   -- Esercizio 5: completato con esito positivo, assegnato da Sara Gallo a Sara Gallo

-- =========================
-- 6. FEEDBACK
-- Inserisce 5 feedback di esempio inviati dai pazienti relativamente agli esercizi svolti
-- Campi: messaggio, id_paziente (codice fiscale), id_esercizio
-- =========================
INSERT INTO Feedback (messaggio, id_paziente, id_esercizio) VALUES
('Esercizio semplice', 'RSSMRA01A01H501A', 1),  -- Feedback 1: Marco Rossi commenta l'esercizio 1
('Un po difficile', 'BNCLGU02B02H501B', 2),     -- Feedback 2: Luca Bianchi commenta l'esercizio 2
('Molto utile', 'VRDANN03C03H501C', 3),          -- Feedback 3: Anna Verdi commenta l'esercizio 3
('Da ripetere', 'NRIPAO04D04H501D', 4),          -- Feedback 4: Paolo Neri commenta l'esercizio 4
('Ben svolto', 'GLLSRA05E05H501E', 5);           -- Feedback 5: Sara Gallo commenta l'esercizio 5

-- =========================
-- 7. COMMENTO
-- Inserisce 5 commenti di esempio scritti dai logopedisti sulle attività
-- La data viene impostata automaticamente dal DEFAULT CURRENT_TIMESTAMP
-- Campi: messaggio, id_logopedista (P.IVA), id_attivita (codice attività)
-- =========================
INSERT INTO Commento (messaggio, id_logopedista, id_attivita) VALUES
('Ottima attività', '12345678901', 1),    -- Commento 1: Maria Rossi commenta l'attività "Pronuncia vocali"
('Molto efficace', '12345678902', 2),     -- Commento 2: Luca Bianchi commenta l'attività "Articolazione consonanti"
('Da migliorare', '12345678903', 3),      -- Commento 3: Anna Verdi commenta l'attività "Memoria verbale"
('Consigliata', '12345678904', 4),        -- Commento 4: Paolo Neri commenta l'attività "Comprensione frasi"
('Ben strutturata', '12345678905', 5);    -- Commento 5: Sara Gallo commenta l'attività "Fluenza verbale"

-- =========================
-- 8. PREFERITI
-- Inserisce 5 record di preferiti: ciascun logopedista salva come preferita un'attività diversa
-- Campi: dataSalvataggio (data in cui è stato aggiunto il preferito), id_logopedista, id_attivita
-- =========================
INSERT INTO Preferiti (dataSalvataggio, id_logopedista, id_attivita) VALUES
('2026-01-10', '12345678901', 1),  -- Preferito 1: Maria Rossi salva l'attività "Pronuncia vocali"
('2026-01-11', '12345678902', 2),  -- Preferito 2: Luca Bianchi salva l'attività "Articolazione consonanti"
('2026-01-12', '12345678903', 3),  -- Preferito 3: Anna Verdi salva l'attività "Memoria verbale"
('2026-01-13', '12345678904', 4),  -- Preferito 4: Paolo Neri salva l'attività "Comprensione frasi"
('2026-01-14', '12345678905', 5);  -- Preferito 5: Sara Gallo salva l'attività "Fluenza verbale"