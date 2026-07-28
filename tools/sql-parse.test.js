import { test } from 'node:test';
import assert from 'node:assert/strict';
import { columns, rows } from './sql-parse.mjs';

const DUMP = `
CREATE TABLE \`t_pages\` (
  \`id\` int(11) NOT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`params\` longtext
) ENGINE=InnoDB;

INSERT INTO \`t_pages\` (\`id\`, \`title\`, \`params\`) VALUES
(1, 'Pierwszy', '<p>Tresc</p>'),
(2, 'Z apostrofem O\\'Brien', '<p>Druga</p>'),
(3, 'Z przecinkiem, w tytule', NULL);
`;

test('czyta nazwy kolumn z CREATE TABLE', () => {
  assert.deepEqual(columns(DUMP, 't_pages'), ['id', 'title', 'params']);
});

test('czyta wiersze jako obiekty', () => {
  const r = rows(DUMP, 't_pages');
  assert.equal(r.length, 3);
  assert.equal(r[0].title, 'Pierwszy');
  assert.equal(r[0].params, '<p>Tresc</p>');
});

test('nie lamie sie na escapowanym apostrofie', () => {
  assert.equal(rows(DUMP, 't_pages')[1].title, "Z apostrofem O'Brien");
});

test('nie lamie sie na przecinku w wartosci', () => {
  assert.equal(rows(DUMP, 't_pages')[2].title, 'Z przecinkiem, w tytule');
});

test('NULL staje sie pustym ciagiem', () => {
  assert.equal(rows(DUMP, 't_pages')[2].params, '');
});

test('nieznana tabela zwraca pusta liste', () => {
  assert.deepEqual(rows(DUMP, 't_brak'), []);
});
