-- =========================
-- POPOLAMENTO DATABASE
-- =========================

-- 1. LOGOPEDISTA
INSERT INTO Logopedista VALUES
('12345678901', 'Rossi', 'Maria', '1980-05-12', '3331112222', 'maria.rossi@mail.it', 'pass123'),
('12345678902', 'Bianchi', 'Luca', '1978-03-21', '3332223333', 'luca.bianchi@mail.it', 'pass123'),
('12345678903', 'Verdi', 'Anna', '1985-11-02', '3334445555', 'anna.verdi@mail.it', 'pass123'),
('12345678904', 'Neri', 'Paolo', '1990-07-18', '3336667777', 'paolo.neri@mail.it', 'pass123'),
('12345678905', 'Gallo', 'Sara', '1983-09-30', '3338889999', 'sara.gallo@mail.it', 'pass123');

-- 2. PAZIENTE
INSERT INTO Paziente VALUES
('RSSMRA01A01H501A', 'Rossi', 'Marco', '2015-06-10', '3401111111', 'marco@mail.it', 'pass', '12345678901'),
('BNCLGU02B02H501B', 'Bianchi', 'Luca', '2012-04-22', '3402222222', 'luca@mail.it', 'pass', '12345678902'),
('VRDANN03C03H501C', 'Verdi', 'Anna', '2010-09-15', '3403333333', 'anna@mail.it', 'pass', '12345678903'),
('NRIPAO04D04H501D', 'Neri', 'Paolo', '2013-01-19', '3404444444', 'paolo@mail.it', 'pass', '12345678904'),
('GLLSRA05E05H501E', 'Gallo', 'Sara', '2014-11-05', '3405555555', 'sara@mail.it', 'pass', '12345678905');

-- 3. ATTIVITA 
INSERT INTO Attivita (titolo, descrizione, istruzioni, immagine, accessibilita, fasciaEta, patologie, id_logopedista) VALUES
('Pronuncia vocali', 'Esercizio base sulle vocali', 'Ripetere le vocali lentamente ad alta voce', 'vocali.jpg', 1, 4, 'DISLALIA,RITARDO LINGUAGGIO', '12345678901'),
('Articolazione consonanti', 'Allenamento gruppi consonantici', 'Pronunciare sillabe scandendo bene', 'consonanti.jpg', 1, 6, 'DISARTRIA', '12345678901'),
('Memoria verbale', 'Esercizi di memoria a breve termine', 'Ascolta la lista e ripeti le parole', 'memoria.jpg', 0, 10, 'AFASIA,ANOMIA', '12345678901'),
('Comprensione frasi', 'Ascolto e comprensione sintattica', 'Rispondere alle domande di controllo', 'frasi.jpg', 1, 8, 'DSL', '12345678901'),
('Fluenza verbale', 'Generazione parole per categoria', 'Dire il massimo numero di parole in 1 minuto', 'fluenza.jpg', 0, 12, 'AFASIA,BALBUZIE', '12345678901');

-- 4. MATERIALE
INSERT INTO Materiale (tipo, immagine, domanda, risposta, rispFalsa, id_attivita) VALUES
('immagine', 'a.jpg', 'Che lettera è?', 'A', 'B', 1),
('immagine', 'b.jpg', 'Che suono senti?', 'BA', 'DA', 2),
('testo', NULL, 'Ripeti la parola', 'Casa', 'Cosa', 3),
('video', NULL, 'Ascolta e rispondi', 'Corretta', 'Errata', 4),
('immagine', 'c.jpg', 'Completa la frase', 'Giusto', 'Sbagliato', 5);

-- 5. ESERCIZIO
INSERT INTO Esercizio (dataAssegnazione, statoCompletamento, durata, esito, id_attivita, id_logopedista, id_paziente) VALUES
('2026-01-01', 'completato', 10, 'positivo', 1, '12345678901', 'RSSMRA01A01H501A'),
('2026-01-02', 'in corso', 15, 'parziale', 2, '12345678902', 'BNCLGU02B02H501B'),
('2026-01-03', 'completato', 20, 'positivo', 3, '12345678903', 'VRDANN03C03H501C'),
('2026-01-04', 'non iniziato', 10, 'nullo', 4, '12345678904', 'NRIPAO04D04H501D'),
('2026-01-05', 'completato', 12, 'positivo', 5, '12345678905', 'GLLSRA05E05H501E');

-- 6. FEEDBACK
INSERT INTO Feedback (messaggio, id_paziente, id_esercizio) VALUES
('Esercizio semplice', 'RSSMRA01A01H501A', 1),
('Un po difficile', 'BNCLGU02B02H501B', 2),
('Molto utile', 'VRDANN03C03H501C', 3),
('Da ripetere', 'NRIPAO04D04H501D', 4),
('Ben svolto', 'GLLSRA05E05H501E', 5);

-- 7. COMMENTO
INSERT INTO Commento (messaggio, id_logopedista, id_attivita) VALUES
('Ottima attività', '12345678901', 1),
('Molto efficace', '12345678902', 2),
('Da migliorare', '12345678903', 3),
('Consigliata', '12345678904', 4),
('Ben strutturata', '12345678905', 5);

-- 8. PREFERITI
INSERT INTO Preferiti VALUES
('2026-01-10', '12345678901', 1),
('2026-01-11', '12345678902', 2),
('2026-01-12', '12345678903', 3),
('2026-01-13', '12345678904', 4),
('2026-01-14', '12345678905', 5);
