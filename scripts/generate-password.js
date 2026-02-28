// Script para generar hash de password
import bcrypt from 'bcryptjs';

const password = 'admin123';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

console.log('\n=== PASSWORD HASH GENERADO ===');
console.log('Password original:', password);
console.log('Hash:', hash);
console.log('\n=== SQL PARA TIDB ===');
console.log(`
USE smartpos_develop;

INSERT INTO usuarios (nombre, username, password, rol, activo) 
VALUES (
  'Administrador',
  'admin',
  '${hash}',
  'admin',
  1
);

SELECT id, nombre, username, rol, activo FROM usuarios;
`);
