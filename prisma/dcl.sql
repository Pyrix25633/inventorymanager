-- ! Modify .env to use root user when executing the 'npx prisma db push' command

CREATE USER 'FoodManager'@'localhost' IDENTIFIED BY 'FoodManager@Mini25633';

GRANT SELECT, INSERT, DELETE ON TempUser TO 'FoodManager'@'localhost';
GRANT SELECT, INSERT, UPDATE ON User TO 'FoodManager'@'localhost';