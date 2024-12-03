-- ! Modify .env to use root user when executing the 'npx prisma db push' command

CREATE USER 'InventoryManager'@'localhost' IDENTIFIED BY 'InventoryManager@Mini25633';

GRANT SELECT, INSERT, DELETE ON TempUser TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE ON User TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE ON Location TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE ON Product TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON Stock TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE ON Category TO 'InventoryManager'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON Book TO 'InventoryManager'@'localhost';